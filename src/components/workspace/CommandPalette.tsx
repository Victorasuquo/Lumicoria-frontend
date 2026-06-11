/**
 * CommandPalette — ⌘K global jump bar.
 *
 * Bound to Cmd/Ctrl + K.  Reads typeahead suggestions from /api/v1/search/suggest
 * and falls back to full federated search on Enter.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { tokens, BRAND_GRADIENT } from "./tokens";

interface Suggestion { kind: string; id: string; name: string; }
interface Hit { kind: string; id: string; title: string; subtitle?: string; url_hint?: string | null; }

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrgId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [hits, setHits] = useState<Record<string, Hit[]>>({});
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  // ⌘K / Ctrl-K binding.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus on open.
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Debounced typeahead.
  useEffect(() => {
    if (!open || !activeOrgId) return;
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    if (!query.trim()) { setSuggestions([]); setHits({}); return; }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), organization_id: activeOrgId });
        const { data } = await api.get(`/search/suggest?${params}`);
        setSuggestions(data.suggestions || []);
      } catch { /* swallow */ }
    }, 150);
  }, [query, open, activeOrgId]);

  const runFullSearch = useCallback(async () => {
    if (!activeOrgId || !query.trim()) return;
    try {
      const params = new URLSearchParams({ q: query.trim(), organization_id: activeOrgId });
      const { data } = await api.get(`/search?${params}`);
      setHits(data.results || {});
    } catch { /* swallow */ }
  }, [query, activeOrgId]);

  const go = (target: { kind: string; id: string; url_hint?: string | null }) => {
    setOpen(false);
    setQuery("");
    if (target.url_hint) { navigate(target.url_hint); return; }
    if (target.kind === "project") navigate(`/workspace/projects/${target.id}`);
    else if (target.kind === "team") navigate(`/workspace/teams/${target.id}`);
    else if (target.kind === "task") navigate(`/tasks?task=${target.id}`);
    else if (target.kind === "document") navigate(`/documents?doc=${target.id}`);
  };

  if (!open) return null;

  const allHits: Array<Hit> = Object.values(hits).flat();
  const targets: Array<{ kind: string; id: string; title: string; subtitle?: string; url_hint?: string | null }> =
    allHits.length > 0
      ? allHits
      : suggestions.map(s => ({ kind: s.kind, id: s.id, title: s.name }));

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: 120,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(640px, 92vw)",
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(18px)",
          borderRadius: 20,
          border: `1px solid ${tokens.SLATE_200}`,
          boxShadow: "0 32px 64px rgba(15,23,42,0.28)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${tokens.SLATE_200}` }}>
          <span style={{
            width: 28, height: 28, borderRadius: 9999,
            background: BRAND_GRADIENT, marginRight: 12,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 12, fontWeight: 700,
          }}>K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { setActive(a => Math.min(a + 1, targets.length - 1)); e.preventDefault(); }
              if (e.key === "ArrowUp") { setActive(a => Math.max(a - 1, 0)); e.preventDefault(); }
              if (e.key === "Enter") {
                if (targets[active]) { go(targets[active]); return; }
                void runFullSearch();
              }
            }}
            placeholder="Jump to project, team, task, or document…"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 16, fontFamily: tokens.BODY_STACK,
              color: tokens.INK, background: "transparent",
            }}
          />
          <span style={{
            padding: "3px 8px", borderRadius: 6,
            background: tokens.SLATE_100, color: tokens.SLATE_500,
            fontSize: 11, fontWeight: 700,
          }}>esc</span>
        </div>

        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {targets.length === 0 ? (
            <div style={{ padding: 24, color: tokens.SLATE_500, fontSize: 13, textAlign: "center" }}>
              {query.trim() ? "No matches yet — press Enter to run a full search." : "Type to search across projects, teams, tasks, and documents."}
            </div>
          ) : targets.map((t, idx) => (
            <button key={`${t.kind}-${t.id}`}
              onClick={() => go(t)}
              onMouseEnter={() => setActive(idx)}
              style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                gap: 12, alignItems: "center", width: "100%",
                padding: "12px 18px", border: "none", textAlign: "left",
                cursor: "pointer", color: tokens.INK,
                background: active === idx ? `${tokens.PURPLE}10` : "transparent",
              }}>
              <span style={{
                padding: "2px 8px", borderRadius: 9999,
                fontSize: 10, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase",
                background: `${tokens.PURPLE}14`, color: tokens.PURPLE_DEEP,
              }}>{t.kind}</span>
              <span>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{t.title}</span>
                {t.subtitle && <span style={{ display: "block", fontSize: 11, color: tokens.SLATE_500 }}>{t.subtitle}</span>}
              </span>
              <span style={{ fontSize: 11, color: tokens.SLATE_400 }}>↵</span>
            </button>
          ))}
        </div>

        <div style={{
          padding: "10px 18px", borderTop: `1px solid ${tokens.SLATE_200}`,
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: tokens.SLATE_500,
        }}>
          <span>↑ ↓ to navigate · ↵ to open</span>
          <span>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
