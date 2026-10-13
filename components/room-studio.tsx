"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Box,
  Check,
  ChevronDown,
  ImagePlus,
  LoaderCircle,
  Maximize2,
  Move3d,
  RotateCcw,
  ScanLine,
  Sparkles,
  Upload,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { RoomCanvas } from "@/components/room-canvas";
import { demoRoom, type RoomSpec } from "@/lib/room-schema";

const suggestions = ["Make it Scandinavian", "Try sage green walls", "Make the sofa blue"];

export function RoomStudio() {
  const [room, setRoom] = useState<RoomSpec>(demoRoom);
  const [selectedId, setSelectedId] = useState<string | null>("sofa-1");
  const [mode, setMode] = useState<"design" | "panorama">("design");
  const [panoramaUrl, setPanoramaUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();
  const [prompt, setPrompt] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [status, setStatus] = useState("Demo room ready");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => room.objects.find((object) => object.id === selectedId) ?? null,
    [room, selectedId],
  );

  useEffect(() => {
    return () => {
      if (panoramaUrl) URL.revokeObjectURL(panoramaUrl);
    };
  }, [panoramaUrl]);

  function uploadPanorama(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (panoramaUrl) URL.revokeObjectURL(panoramaUrl);
    setPanoramaUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setMode("panorama");
    setStatus("Panorama loaded locally");
  }

  async function runPrompt(value: string) {
    const cleanPrompt = value.trim();
    if (!cleanPrompt || isThinking) return;
    setPrompt("");
    setIsThinking(true);
    setStatus("Nemotron planner is composing…");

    try {
      const response = await fetch("/api/room-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt, currentSpec: room }),
      });
      if (!response.ok) throw new Error("Planner request failed");
      const data = (await response.json()) as { room: RoomSpec; mock: boolean };
      setRoom(data.room);
      setMode("design");
      setStatus(data.mock ? "Concept updated in demo mode" : "Concept updated by Nemotron");
    } catch {
      setStatus("Could not update the room. Try again.");
    } finally {
      setIsThinking(false);
    }
  }

  function submitPrompt(event: FormEvent) {
    event.preventDefault();
    void runPrompt(prompt);
  }

  function updateSelected(patch: Partial<NonNullable<typeof selected>>) {
    if (!selectedId) return;
    setRoom((current) => ({
      ...current,
      objects: current.objects.map((object) => (object.id === selectedId ? { ...object, ...patch } : object)),
    }));
    setStatus("Object adjusted manually");
  }

  function nudge(dx: number, dz: number) {
    if (!selected) return;
    updateSelected({ position: [selected.position[0] + dx, selected.position[1], selected.position[2] + dz] });
  }

  return (
    <main className="studio-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="RoomShift home">
          <span className="brand-mark"><ScanLine size={19} /></span>
          <span>RoomShift <b>360</b></span>
        </a>
        <div className="project-title">
          <span className="saved-dot"><Check size={11} /></span>
          <span>{room.name}</span>
          <ChevronDown size={14} />
        </div>
        <div className="top-actions">
          <span className="prototype-pill">Hackathon prototype</span>
          <button className="icon-button" type="button" title="Reset room" onClick={() => { setRoom(demoRoom); setSelectedId("sofa-1"); setStatus("Demo room restored"); }}>
            <RotateCcw size={17} />
          </button>
          <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> Upload 360
          </button>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={uploadPanorama} />
        </div>
      </header>

      <section className="workspace">
        <aside className="left-panel">
          <div className="panel-heading">
            <p className="eyebrow">Capture</p>
            <h1>Shape your space.</h1>
            <p>Turn a room panorama into an editable spatial concept.</p>
          </div>

          <button className={`capture-card ${panoramaUrl ? "has-file" : ""}`} type="button" onClick={() => inputRef.current?.click()}>
            <span className="capture-icon">{panoramaUrl ? <Check size={21} /> : <ImagePlus size={21} />}</span>
            <span>
              <strong>{fileName ?? "Add a 360° panorama"}</strong>
              <small>{fileName ? "Stored locally in your browser" : "Equirectangular JPG or PNG"}</small>
            </span>
          </button>

          <div className="view-switch" role="group" aria-label="Viewer mode">
            <button type="button" className={mode === "panorama" ? "active" : ""} disabled={!panoramaUrl} onClick={() => setMode("panorama")}>
              <Maximize2 size={15} /> Original 360
            </button>
            <button type="button" className={mode === "design" ? "active" : ""} onClick={() => setMode("design")}>
              <Box size={15} /> Spatial twin
            </button>
          </div>

          <div className="scene-list">
            <div className="section-label"><span>Scene objects</span><b>{room.objects.length}</b></div>
            {room.objects.map((object) => (
              <button key={object.id} type="button" className={selectedId === object.id ? "scene-item active" : "scene-item"} onClick={() => { setSelectedId(object.id); setMode("design"); }}>
                <span className="object-swatch" style={{ backgroundColor: object.color }} />
                <span>{object.label}</span>
                <small>{object.type}</small>
              </button>
            ))}
          </div>

          <div className="privacy-note">
            <span>Private by default</span>
            <p>Your uploaded image stays in this browser in the current prototype.</p>
          </div>
        </aside>

        <section className="viewport-panel">
          <div className="viewport-toolbar">
            <span className="mode-badge"><span className="live-dot" /> {mode === "design" ? "Editable spatial twin" : "Immersive panorama"}</span>
            <span className="viewport-help">Drag to orbit · Scroll to zoom · Select an object</span>
          </div>
          <div className="canvas-wrap">
            <RoomCanvas room={room} panoramaUrl={panoramaUrl} mode={mode} selectedId={selectedId} onSelect={setSelectedId} />
            {!panoramaUrl && mode === "design" && (
              <button className="empty-panorama" type="button" onClick={() => inputRef.current?.click()}>
                <ImagePlus size={16} /> Add a real room panorama
              </button>
            )}
          </div>
          <div className="statusbar">
            <span>{status}</span>
            <span>{room.dimensions.width}m × {room.dimensions.depth}m · {room.objects.length} objects</span>
          </div>
        </section>

        <aside className="right-panel">
          <div className="agent-heading">
            <span className="agent-avatar"><Sparkles size={18} /></span>
            <div><strong>Design agent</strong><small>Powered by NVIDIA Nemotron</small></div>
          </div>

          <div className="agent-intro">
            <p className="eyebrow">Creative direction</p>
            <h2>What should we change?</h2>
            <p>Describe a mood, material, color, or layout change. The agent updates the structured room plan.</p>
          </div>

          <form className="prompt-box" onSubmit={submitPrompt}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Try “Make it Scandinavian with sage walls…”" rows={4} />
            <div className="prompt-actions">
              <span><Bot size={14} /> Room planner</span>
              <button type="submit" disabled={!prompt.trim() || isThinking} aria-label="Apply prompt">
                {isThinking ? <LoaderCircle className="spin" size={17} /> : <ArrowUp size={17} />}
              </button>
            </div>
          </form>

          <div className="suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => void runPrompt(suggestion)}>{suggestion}</button>
            ))}
          </div>

          {selected && (
            <div className="inspector">
              <div className="section-label"><span>Selected object</span><Move3d size={15} /></div>
              <div className="selected-name"><span className="object-swatch large" style={{ backgroundColor: selected.color }} /><div><strong>{selected.label}</strong><small>{selected.type}</small></div></div>
              <label className="color-field">Color <input type="color" value={selected.color} onChange={(event) => updateSelected({ color: event.target.value })} /></label>
              <div className="nudge-control" aria-label="Move selected object">
                <span />
                <button type="button" onClick={() => nudge(0, -0.2)}><ArrowUp size={15} /></button>
                <span />
                <button type="button" onClick={() => nudge(-0.2, 0)}><ArrowLeft size={15} /></button>
                <button type="button" className="nudge-center" title="Object position"><Move3d size={14} /></button>
                <button type="button" onClick={() => nudge(0.2, 0)}><ArrowRight size={15} /></button>
                <span />
                <button type="button" onClick={() => nudge(0, 0.2)}><ArrowDown size={15} /></button>
                <span />
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
