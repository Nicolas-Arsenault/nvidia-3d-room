import { z } from "zod";

export const roomObjectSchema = z.object({
  id: z.string(),
  type: z.enum(["sofa", "table", "rug", "plant", "lamp", "bed", "shelf"]),
  label: z.string(),
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.number(),
  scale: z.tuple([z.number().positive(), z.number().positive(), z.number().positive()]),
  color: z.string(),
});

export const roomSpecSchema = z.object({
  name: z.string(),
  dimensions: z.object({
    width: z.number().min(2).max(12),
    depth: z.number().min(2).max(12),
    height: z.number().min(2).max(5),
  }),
  surfaces: z.object({
    wallColor: z.string(),
    floorColor: z.string(),
    floorMaterial: z.enum(["wood", "concrete", "tile", "carpet"]),
  }),
  objects: z.array(roomObjectSchema).max(20),
});

export type RoomObject = z.infer<typeof roomObjectSchema>;
export type RoomSpec = z.infer<typeof roomSpecSchema>;

export const demoRoom: RoomSpec = {
  name: "Sunlit living room",
  dimensions: { width: 6.4, depth: 5.2, height: 2.8 },
  surfaces: {
    wallColor: "#e9e5dc",
    floorColor: "#9a7658",
    floorMaterial: "wood",
  },
  objects: [
    {
      id: "sofa-1",
      type: "sofa",
      label: "Modular sofa",
      position: [-1.25, 0.48, -1.45],
      rotation: 0,
      scale: [2.55, 0.9, 0.95],
      color: "#596b68",
    },
    {
      id: "table-1",
      type: "table",
      label: "Coffee table",
      position: [0, 0.35, 0.05],
      rotation: 0,
      scale: [1.55, 0.15, 0.9],
      color: "#9b704f",
    },
    {
      id: "rug-1",
      type: "rug",
      label: "Woven rug",
      position: [0, 0.025, -0.05],
      rotation: 0,
      scale: [3.7, 0.04, 2.65],
      color: "#d4c5ae",
    },
    {
      id: "plant-1",
      type: "plant",
      label: "Floor plant",
      position: [2.25, 0.6, -1.75],
      rotation: 0,
      scale: [0.7, 1.2, 0.7],
      color: "#49634f",
    },
    {
      id: "lamp-1",
      type: "lamp",
      label: "Floor lamp",
      position: [-2.45, 1.05, -1.7],
      rotation: 0,
      scale: [0.55, 2.1, 0.55],
      color: "#d2a85b",
    },
  ],
};

export function applyDemoPrompt(spec: RoomSpec, prompt: string): RoomSpec {
  const value = prompt.toLowerCase();
  const next = structuredClone(spec);

  if (value.includes("scandinav")) {
    next.name = "Scandinavian retreat";
    next.surfaces.wallColor = "#f3f0e8";
    next.surfaces.floorColor = "#c7a87b";
    next.objects = next.objects.map((object) => ({
      ...object,
      color:
        object.type === "sofa"
          ? "#d5c9b8"
          : object.type === "rug"
            ? "#ded7ca"
            : object.color,
    }));
  }

  if (value.includes("dark") || value.includes("moody")) {
    next.name = "Moody lounge";
    next.surfaces.wallColor = "#343b3c";
    next.surfaces.floorColor = "#5c4435";
  }

  if (value.includes("green wall") || value.includes("sage")) {
    next.surfaces.wallColor = "#9aaa8c";
  }

  if (value.includes("blue sofa")) {
    next.objects = next.objects.map((object) =>
      object.type === "sofa" ? { ...object, color: "#466a85" } : object,
    );
  }

  if (value.includes("beige sofa")) {
    next.objects = next.objects.map((object) =>
      object.type === "sofa" ? { ...object, color: "#c7b7a0" } : object,
    );
  }

  if (value.includes("bigger sofa") || value.includes("larger sofa")) {
    next.objects = next.objects.map((object) =>
      object.type === "sofa"
        ? { ...object, scale: [object.scale[0] * 1.2, object.scale[1], object.scale[2]] }
        : object,
    );
  }

  return next;
}
