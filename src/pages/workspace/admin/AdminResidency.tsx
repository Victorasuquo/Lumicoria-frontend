/**
 * /workspace/admin/residency — data residency region picker.
 */

import React, { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { enterpriseApi } from "@/services/workspaceApi";
import { GlassCard, SectionHeader, Button, Skeleton } from "@/components/workspace/primitives";
import { tokens } from "@/components/workspace/tokens";
import { toast } from "sonner";

const REGIONS = [
  { id: "us", label: "United States", description: "us-east-1 / us-west-2 multi-AZ" },
  { id: "eu", label: "European Union", description: "eu-central-1 (Frankfurt) — GDPR-resident" },
  { id: "in", label: "India", description: "ap-south-1 (Mumbai) — DPDPA-resident" },
  { id: "ca", label: "Canada", description: "ca-central-1 (Toronto)" },
  { id: "au", label: "Australia", description: "ap-southeast-2 (Sydney)" },
];

export const AdminResidency: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const [region, setRegion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrgId) return;
    setLoading(true);
    enterpriseApi.residency(activeOrgId)
      .then((d: any) => setRegion(d?.region || null))
      .catch(() => setRegion(null))
      .finally(() => setLoading(false));
  }, [activeOrgId]);

  const save = async (id: string) => {
    if (!activeOrgId) return;
    try {
      await enterpriseApi.setResidency(activeOrgId, { region: id });
      setRegion(id); toast.success(`Data residency set to ${id.toUpperCase()}.`);
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Update failed."); }
  };

  if (!activeOrgId) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Data residency"
        subtitle="Choose where your workspace's data is physically stored. Available on Enterprise."
      />

      {loading ? <GlassCard padding={20}><Skeleton height={16} /></GlassCard> :
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {REGIONS.map(r => {
            const active = region === r.id;
            return (
              <GlassCard key={r.id} padding={16} style={{ borderColor: active ? tokens.PURPLE : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Globe size={20} color={active ? tokens.PURPLE : tokens.SLATE_500} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: tokens.INK }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: tokens.SLATE_500 }}>{r.description}</div>
                  </div>
                  <Button tone={active ? "ghost" : "outline"} size="sm" onClick={() => save(r.id)} disabled={active}>
                    {active ? "Active" : "Switch"}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>}

      <p style={{ fontSize: 12, color: tokens.SLATE_500, marginTop: 4 }}>
        Switching regions triggers a migration. Existing data is copied to the new region and the source data is purged after verification.
      </p>
    </div>
  );
};

export default AdminResidency;
