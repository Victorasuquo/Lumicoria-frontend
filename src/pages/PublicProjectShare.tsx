import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";

/**
 * Read-only public project view, opened from an external share link
 * (/p/:projectId/share/:token). Resolves the token against the public
 * resolver — no auth required. Deliberately minimal: name, description,
 * task stats, and a recent-task slice. Never shows members or internals.
 */
interface ShareData {
  project: { id: string; name?: string; description?: string; status?: string; color?: string };
  stats: { total_tasks: number; completed_tasks: number };
  tasks: Array<{ id: string; title?: string; status?: string; due_date?: string }>;
  read_only: boolean;
}

const PublicProjectShare: React.FC = () => {
  const { projectId, token } = useParams<{ projectId: string; token: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !token) return;
    setLoading(true);
    api.get(`/public/projects/${projectId}/share/${token}`)
      .then(r => setData(r.data as ShareData))
      .catch(e => setError(e?.response?.data?.detail || "This link is invalid or has been revoked."))
      .finally(() => setLoading(false));
  }, [projectId, token]);

  const wrap: React.CSSProperties = { maxWidth: 820, margin: "0 auto", padding: "48px 20px", fontFamily: "Space Grotesk, system-ui, sans-serif" };

  if (loading) return <div style={wrap}><p style={{ color: "#64748b" }}>Loading…</p></div>;
  if (error || !data) return (
    <div style={wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Link unavailable</h1>
      <p style={{ color: "#64748b" }}>{error || "Nothing to show."}</p>
    </div>
  );

  const pct = data.stats.total_tasks ? Math.round((data.stats.completed_tasks / data.stats.total_tasks) * 100) : 0;

  return (
    <div style={wrap}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
        Read-only shared project
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: 999, background: data.project.color || "#6C4AB0" }} />
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.6, color: "#0f172a", margin: 0 }}>{data.project.name || "Untitled project"}</h1>
      </div>
      {data.project.description && <p style={{ color: "#475569", fontSize: 15, marginTop: 8 }}>{data.project.description}</p>}

      <div style={{ display: "flex", gap: 28, margin: "24px 0", padding: "18px 20px", border: "1px solid #e2e8f0", borderRadius: 14 }}>
        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Tasks</div><div style={{ fontSize: 28, fontWeight: 700 }}>{data.stats.total_tasks}</div></div>
        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Completed</div><div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{data.stats.completed_tasks}</div></div>
        <div><div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Progress</div><div style={{ fontSize: 28, fontWeight: 700, color: "#6C4AB0" }}>{pct}%</div></div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Recent tasks</h2>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        {data.tasks.length === 0 ? (
          <div style={{ padding: 20, color: "#64748b" }}>No tasks yet.</div>
        ) : data.tasks.map((t, i) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center", padding: "11px 16px", borderBottom: i < data.tasks.length - 1 ? "1px solid #e2e8f0" : "none" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{t.title || "Untitled task"}</span>
            <span style={{ fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{(t.status || "todo").replace(/_/g, " ")}</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{t.due_date ? new Date(t.due_date).toLocaleDateString() : ""}</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 28, color: "#94a3b8", fontSize: 12 }}>Shared via Lumicoria AI · this is a read-only snapshot.</p>
    </div>
  );
};

export default PublicProjectShare;
