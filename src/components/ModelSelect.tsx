import { useState, useRef, useEffect, useMemo } from "react";
import type { OpenRouterModel } from "../types";

interface Props {
  models: OpenRouterModel[];
  selected: string;
  onChange: (modelId: string) => void;
}

export function ModelSelect({ models, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return models;
    const q = search.toLowerCase();
    return models.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    );
  }, [models, search]);

  const selectedLabel = models.find((m) => m.id === selected)?.name || selected || "Select model";

  if (models.length === 0) return null;

  return (
    <>
      <button className="model-trigger" onClick={() => setOpen(true)}>
        <span className="model-trigger-label">{selectedLabel}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="model-modal" onClick={(e) => e.stopPropagation()}>
            <div className="model-modal-header">
              <h2>Select Model</h2>
              <button className="modal-close" onClick={() => setOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="model-modal-search">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search models by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="model-modal-count">
              {filtered.length} of {models.length} models
            </div>
            <ul className="model-modal-list">
              {filtered.length === 0 ? (
                <li className="model-modal-empty">No models match your search</li>
              ) : (
                filtered.map((m) => (
                  <li
                    key={m.id}
                    className={`model-modal-item${m.id === selected ? " active" : ""}`}
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                  >
                    <div className="model-modal-item-name">{m.name || m.id}</div>
                    <div className="model-modal-item-meta">
                      <span className="model-modal-item-id">{m.id}</span>
                      {m.context_length && (
                        <span className="model-modal-item-ctx">
                          {(m.context_length / 1000).toFixed(0)}k ctx
                        </span>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
