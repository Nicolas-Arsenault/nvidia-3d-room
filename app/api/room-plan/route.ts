import { NextRequest, NextResponse } from "next/server";
import { applyDemoPrompt, demoRoom, roomSpecSchema } from "@/lib/room-schema";

const SYSTEM_PROMPT = `You are the spatial design planner for RoomShift 360.
Return only valid JSON matching the supplied RoomSpec structure.
Keep object ids stable when editing. Use realistic metric dimensions.
The scene must have no more than 20 objects and may only use these object types:
sofa, table, rug, plant, lamp, bed, shelf.`;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { prompt?: string; currentSpec?: unknown };
  const prompt = body.prompt?.trim();
  const parsed = roomSpecSchema.safeParse(body.currentSpec ?? demoRoom);
  const currentSpec = parsed.success ? parsed.data : demoRoom;

  if (!prompt) {
    return NextResponse.json({ error: "A design prompt is required." }, { status: 400 });
  }

  const apiKey = process.env.NEBIUS_API_KEY;
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return NextResponse.json({ room: applyDemoPrompt(currentSpec, prompt), mock: true });
  }

  try {
    const response = await fetch(`${process.env.NEBIUS_BASE_URL ?? "https://api.tokenfactory.nebius.com/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.NEBIUS_MODEL ?? "nvidia/Nemotron-3_5-Lightning",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Current RoomSpec:\n${JSON.stringify(currentSpec)}\n\nRequested change:\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Token Factory returned ${response.status}`);
    }

    const completion = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = completion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Token Factory returned no content");
    const room = roomSpecSchema.parse(JSON.parse(content));
    return NextResponse.json({ room, mock: false });
  } catch (error) {
    console.error("Room planner failed", error);
    return NextResponse.json(
      { error: "The room planner could not produce a valid room specification." },
      { status: 502 },
    );
  }
}
