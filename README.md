# RoomShift 360

RoomShift 360 is an AI-assisted spatial redesign prototype for the Nebius × NVIDIA Global AI Hackathon. Upload a 360° room panorama, explore it immersively, and use an editable Three.js spatial twin to test layouts, colors, and design directions.

The app works without API credentials in demo mode. When a Nebius Token Factory key is configured, NVIDIA Nemotron becomes the structured room-planning agent.

## Current prototype

- Local 360° equirectangular image upload and immersive viewer
- Editable Three.js room with selectable furniture
- Object color and position controls
- Natural-language design prompt panel
- Rule-based fallback planner when no API key is present
- Server-side Token Factory integration seam with validated `RoomSpec` output
- Responsive interface suitable for Vercel deployment

## Stack

- Next.js 15 and TypeScript
- React Three Fiber, Drei, and Three.js
- Zod-validated room specifications
- NVIDIA Nemotron through the Nebius Token Factory OpenAI-compatible API
- Vercel for frontend and serverless API hosting

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are required for the demo experience.

## Connect Nebius Token Factory

Copy the environment template:

```bash
cp .env.example .env.local
```

Then configure:

```env
NEBIUS_API_KEY=your_token_factory_key
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1
NEBIUS_MODEL=nvidia/Nemotron-3_5-Lightning
```

Use a model identifier enabled in your Token Factory account. The API key remains server-side in `app/api/room-plan/route.ts` and is never sent to the browser.

## Architecture

```text
360 panorama ───────────────→ Three.js panorama viewer
       │
       └→ Room planning request → Nemotron / demo planner
                                    │
                                    ↓
                              validated RoomSpec
                                    │
                                    ↓
                         editable Three.js spatial twin
```

`RoomSpec` is the contract between AI reasoning and rendering. Keeping that contract constrained makes generation predictable and prevents model output from executing arbitrary code.

## Suggested next milestones

1. Add a vision-capable Token Factory model for panorama-to-`RoomSpec` analysis.
2. Add click-to-place furniture and direct transform gizmos.
3. Add a curated GLB furniture library and glTF export.
4. Store projects in object storage or a small database.
5. Add before/after renders and shareable project URLs.

## License

[MIT](LICENSE)
