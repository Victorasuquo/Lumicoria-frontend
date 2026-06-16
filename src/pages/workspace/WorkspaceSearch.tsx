/**
 * /workspace/search — full-page federated search.  Powered by
 * searchApi.query() with saved + recent rails on the side.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Clock, Bookmark, X } from "lucide-react";
import searchApi, { type SearchHit } from "@/services/searchApi";
import {
  GlassCard, SectionHeader, Button, Input, Skeleton, EmptyState, FilterChips,
  Toolbar, OrbEmptyState, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, BRAND_GRADIENT, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

const TYPE_FILTERS = [
  { id: "team", label: "Teams" },
  { id: "project", label: "Projects" },
  { id: "task", label: "Tasks" },
  { id: "document", label: "Documents" },
  { id: "agent", label: "Agents" },
  { id: "comment", label: "Comments" },
  { id: "channel", label: "Channels" },
];

const RESULT_URL: Record<string, (id: string) => string> = {
  team: id => `/workspace/teams/${id}`,
  project: id => `/workspace/projects/${id}`,
  task: id => `/tasks?focus=${id}`,
  document: id => `/documents?focus=${id}`,
  agent: id => `/agents/${id}`,
  comment: id => `/notifications?id=${id}`,
  channel: id => `/workspace/projects?channel=${id}`,
};

export const WorkspaceSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [debounced, setDebounced] = useState(initialQ);
  const [types, setTypes] = useState<string[]>([]);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Array<{ id: string; name: string; query: string }>>([]);
  const [recent, setRecent] = useState<Array<{ id?: string; query: string }>>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(q), 220);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    Promise.all([
      searchApi.saved().then(setSaved).catch(() => setSaved([])),
      searchApi.recent().then(setRecent).catch(() => setRecent([])),
    ]);
  }, []);

  useEffect(() => {
    if (!debounced || debounced.length < 2) { setHits([]); return; }
    setLoading(true);
    searchApi.query(debounced, { types: types.length ? types : undefined, limit: 50 })
      .then(r => setHits(r.hits || []))
      .catch(() => setHits([]))
      .finally(() => setLoading(false));
    setSearchParams(prev => { const p = new URLSearchParams(prev); p.set("q", debounced); return p; }, { replace: true });
    searchApi.touchRecent({ query: debounced }).catch(() => {});
  }, [debounced, types]); // eslint-disable-line

  const saveCurrent = async () => {
    if (!q.trim()) return;
    const name = window.prompt("Name this search", q);
    if (!name) return;
    try {
      const row = await searchApi.createSaved({ name, query: q, filters: { types } });
      setSaved(prev => [row, ...prev]);
      toast.success("Search saved.");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not save.");
    }
  };

  const grouped = useMemo(() => {
    const m = new Map<string, SearchHit[]>();
    for (const h of hits) {
      const arr = m.get(h.resource_type) || [];
      arr.push(h); m.set(h.resource_type, arr);
    }
    return Array.from(m.entries());
  }, [hits]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Search"
        title="Find anything in the workspace"
        subtitle="Teams, projects, tasks, documents, agents, comments, channels — all in one place."
      />

      <Toolbar
        left={
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flex: 1, minWidth: 280 }}>
            <Search size={16} color={tokens.SLATE_500} />
            <Input
              autoFocus value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search…"
              style={{ flex: 1, minWidth: 280 }}
            />
          </div>
        }
        center={<FilterChips options={TYPE_FILTERS} value={types} onChange={v => setTypes(v as string[])} multi label="Types" />}
        right={
          <>
            {q.trim() && (
              <Button tone="outline" size="sm" onClick={saveCurrent}>
                <Bookmark size={14} /> Save search
              </Button>
            )}
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        <div>
          {loading ? (
            <GlassCard padding={20}><Skeleton height={16} /><Skeleton height={16} style={{ marginTop: 10 }} /><Skeleton height={16} style={{ marginTop: 10 }} /></GlassCard>
          ) : !debounced ? (
            <OrbEmptyState title="Start typing" body="Federated search across every resource in your workspace." />
          ) : hits.length === 0 ? (
            <OrbEmptyState title="No matches" body={`Nothing found for "${debounced}".`} />
          ) : grouped.map(([type, rows], gi) => (
            <motion.div key={type} {...STAGGER_FAST(gi)} style={{ marginBottom: 16 }}>
              <SectionHeader title={`${type[0].toUpperCase() + type.slice(1)} (${rows.length})`} />
              <GlassCard padding={6}>
                {rows.map((h, i) => (
                  <button
                    key={`${h.resource_type}:${h.resource_id}:${i}`}
                    onClick={() => navigate(RESULT_URL[h.resource_type]?.(h.resource_id) || `/workspace`)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, width: "100%",
                      padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer",
                      textAlign: "left", color: tokens.INK,
                      borderBottom: i < rows.length - 1 ? `1px solid ${tokens.SLATE_100}` : "none",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{h.title}</span>
                    {h.snippet && <span style={{ fontSize: 12, color: tokens.SLATE_500, lineHeight: 1.5 }}>{h.snippet}</span>}
                  </button>
                ))}
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <GlassCard padding={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Star size={14} color={tokens.PURPLE} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Saved</span>
            </div>
            {saved.length === 0 ? (
              <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>Save your most-used queries.</div>
            ) : saved.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${tokens.SLATE_100}` }}>
                <button onClick={() => setQ(s.query)} style={{ background: "transparent", border: "none", color: tokens.INK, padding: 0, fontWeight: 600, fontSize: 13, cursor: "pointer", textAlign: "left", flex: 1 }}>{s.name}</button>
                <button onClick={() => searchApi.deleteSaved(s.id).then(() => setSaved(prev => prev.filter(x => x.id !== s.id)))} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><X size={12} /></button>
              </div>
            ))}
          </GlassCard>

          <GlassCard padding={16}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Clock size={14} color={tokens.SLATE_500} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: tokens.SLATE_500 }}>Recent</span>
            </div>
            {recent.length === 0 ? (
              <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>Recent queries appear here.</div>
            ) : recent.slice(0, 12).map((r, i) => (
              <button key={i} onClick={() => setQ(r.query)} style={{ display: "block", width: "100%", padding: "6px 0", background: "transparent", border: "none", color: tokens.SLATE_700, textAlign: "left", fontSize: 13, cursor: "pointer", borderBottom: i < Math.min(recent.length, 12) - 1 ? `1px solid ${tokens.SLATE_100}` : "none" }}>{r.query}</button>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSearch;
