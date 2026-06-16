/**
 * /workspace/admin/custom-roles — custom role manager.  Powered by
 * orgExtendedApi.customRoles + createCustomRole + updateCustomRole +
 * deleteCustomRole.  Business+ plans only.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Shield } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgExtendedApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Input, Textarea, Skeleton, OrbEmptyState, FilterChips, BrandPill, CardGrid,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  created_at?: string;
}

const PERMISSIONS = [
  "view_workspace", "create_project", "create_team", "invite_members",
  "manage_members", "manage_billing", "manage_branding", "manage_settings",
  "manage_automations", "manage_webhooks", "manage_api_tokens",
  "manage_integrations", "manage_sso", "manage_scim", "manage_custom_domains",
  "view_audit", "export_audit", "manage_seats", "manage_enterprise_features",
];

export const AdminCustomRoles: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [rows, setRows] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await orgExtendedApi.customRoles(activeOrgId);
      setRows(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const create = async () => {
    if (!activeOrgId || !name.trim()) return;
    try {
      const row: any = await orgExtendedApi.createCustomRole(activeOrgId, { name, description, permissions: picked });
      setRows(prev => [row, ...prev]);
      setShowNew(false); setName(""); setDescription(""); setPicked([]);
      toast.success("Role created.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  const remove = async (id: string) => {
    if (!activeOrgId || !confirm("Delete this role? Any users assigned will fall back to member.")) return;
    try { await orgExtendedApi.deleteCustomRole(activeOrgId, id); setRows(prev => prev.filter(r => r.id !== id)); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Custom roles"
        subtitle="Define your own role with a curated permission set. Assign on the org members page."
        right={<Button tone="primary" onClick={() => setShowNew(s => !s)}><Plus size={14} /> New role</Button>}
      />

      {showNew && (
        <GlassCard padding={20}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Input placeholder="Role name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            <Input placeholder="Short description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ marginTop: 14 }}>
            <FilterChips
              options={PERMISSIONS.map(p => ({ id: p, label: p.replace(/_/g, " ") }))}
              value={picked} onChange={v => setPicked(v as string[])} multi label="Permissions"
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Button tone="primary" onClick={create} disabled={!name.trim()}>Create role</Button>
            <Button tone="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard padding={20}><Skeleton height={20} /></GlassCard>
      ) : rows.length === 0 ? (
        <OrbEmptyState title="No custom roles" body="The default roles (owner / admin / member / viewer) cover most needs. Add custom ones when you need finer-grained control." />
      ) : (
        <CardGrid minCol={300} gap={14}>
          {rows.map((r, i) => (
            <motion.div key={r.id} {...STAGGER_FAST(i)}>
              <GlassCard padding={18}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Shield size={14} color={tokens.PURPLE} />
                      <h3 style={{ margin: 0, fontFamily: tokens.DISPLAY_STACK, fontSize: 16 }}>{r.name}</h3>
                    </div>
                    {r.description && <p style={{ margin: "6px 0 8px", color: tokens.SLATE_600, fontSize: 13 }}>{r.description}</p>}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {r.permissions.slice(0, 8).map(p => (
                        <BrandPill key={p} tone="ghost" style={{ fontSize: 10 }}>{p.replace(/_/g, " ")}</BrandPill>
                      ))}
                      {r.permissions.length > 8 && <span style={{ fontSize: 11, color: tokens.SLATE_500 }}>+{r.permissions.length - 8} more</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(r.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: tokens.SLATE_400 }}><Trash2 size={14} /></button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </CardGrid>
      )}
    </div>
  );
};

export default AdminCustomRoles;
