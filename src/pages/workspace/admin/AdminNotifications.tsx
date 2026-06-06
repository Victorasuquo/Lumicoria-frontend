import React, { useEffect, useMemo, useState } from "react";
import { notificationRulesApi } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Skeleton, BrandPill, Button, Input } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";

interface PrefRow { channel: string; category: string; enabled: boolean; quiet_hours?: { start?: string; end?: string; timezone?: string } | null; id?: string | null; }

export const AdminNotifications: React.FC = () => {
  const [prefs, setPrefs] = useState<PrefRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [qhStart, setQhStart] = useState("21:00");
  const [qhEnd, setQhEnd] = useState("07:00");
  const [qhTz, setQhTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      notificationRulesApi.preferences(),
      notificationRulesApi.categories(),
    ]).then(([p, c]) => {
      setPrefs(p);
      setCategories(c.categories);
      setChannels(c.channels);
    }).finally(() => setLoading(false));
  }, []);

  const grid = useMemo(() => {
    const lookup = new Map<string, PrefRow>();
    prefs.forEach(p => lookup.set(`${p.channel}:${p.category}`, p));
    return lookup;
  }, [prefs]);

  const toggle = async (channel: string, category: string) => {
    const key = `${channel}:${category}`;
    const cur = grid.get(key);
    const next = !(cur?.enabled ?? true);
    const updated = await notificationRulesApi.upsert({ channel, category, enabled: next });
    setPrefs(prev => {
      const without = prev.filter(p => !(p.channel === channel && p.category === category));
      return [...without, updated as PrefRow];
    });
  };

  const saveQuietHours = async () => {
    setBusy(true); setMsg(null);
    try {
      await notificationRulesApi.setQuietHours({ start: qhStart, end: qhEnd, timezone: qhTz });
      setMsg("Quiet hours saved.");
    } catch { setMsg("Save failed."); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionHeader eyebrow="Notifications" title="Preferences & quiet hours" subtitle="Decide which categories reach which channel for this user, and when." />

      <GlassCard padding={22}>
        <h3 style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 10 }}>Quiet hours</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr auto", gap: 12, alignItems: "end" }}>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Start</div>
            <Input type="time" value={qhStart} onChange={e => setQhStart(e.target.value)} />
          </label>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>End</div>
            <Input type="time" value={qhEnd} onChange={e => setQhEnd(e.target.value)} />
          </label>
          <label>
            <div style={{ fontSize: 12, color: tokens.SLATE_500, marginBottom: 6, fontWeight: 600 }}>Timezone</div>
            <Input value={qhTz} onChange={e => setQhTz(e.target.value)} />
          </label>
          <Button tone="primary" onClick={saveQuietHours} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </div>
        {msg && <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 8 }}>{msg}</div>}
      </GlassCard>

      <GlassCard padding={4}>
        {loading ? (
          <div style={{ padding: 24 }}><Skeleton height={20} /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.6)" }}>
                  <th style={{ textAlign: "left", padding: "12px 16px", color: tokens.SLATE_500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Category</th>
                  {channels.map(c => (
                    <th key={c} style={{ textAlign: "center", padding: "12px 16px", color: tokens.SLATE_500, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>{c === "in_app" ? "In app" : c.charAt(0).toUpperCase() + c.slice(1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, ci) => (
                  <tr key={cat} style={{ borderTop: `1px solid ${tokens.SLATE_200}` }}>
                    <td style={{ padding: "12px 16px", color: tokens.INK, fontWeight: 600 }}>{cat.replace(/[_\.]/g, " ")}</td>
                    {channels.map(ch => {
                      const p = grid.get(`${ch}:${cat}`);
                      const enabled = p?.enabled ?? true;
                      return (
                        <td key={ch} style={{ textAlign: "center", padding: "12px 16px" }}>
                          <button onClick={() => toggle(ch, cat)} aria-label={`${ch} ${cat}`} style={{
                            width: 36, height: 20, borderRadius: 9999,
                            background: enabled ? tokens.PURPLE : tokens.SLATE_200,
                            border: "none", cursor: "pointer", position: "relative",
                          }}>
                            <span style={{
                              position: "absolute", top: 2, left: enabled ? 18 : 2,
                              width: 16, height: 16, borderRadius: 9999, background: "white",
                              transition: "left 120ms ease",
                              boxShadow: "0 1px 3px rgba(15,23,42,0.18)",
                            }} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminNotifications;
