/**
 * /workspace/admin/onboarding-checklist — interactive setup checklist
 * for new workspaces.  Powered by orgExtendedApi.onboardingChecklist.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { orgExtendedApi } from "@/services/workspaceApi";
import {
  GlassCard, SectionHeader, Button, Skeleton, OrbEmptyState,
} from "@/components/workspace/primitives";
import { tokens, STAGGER_FAST } from "@/components/workspace/tokens";
import { toast } from "sonner";

interface ChecklistStep {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  href?: string;
  category?: string;
}

export const AdminOnboardingChecklist: React.FC = () => {
  const { activeOrgId } = useWorkspace();
  const navigate = useNavigate();
  const [steps, setSteps] = useState<ChecklistStep[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    try {
      const data: any = await orgExtendedApi.onboardingChecklist(activeOrgId);
      setSteps(Array.isArray(data) ? data : Array.isArray(data?.steps) ? data.steps : []);
    } catch { setSteps([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [activeOrgId]); // eslint-disable-line

  const complete = async (stepId: string) => {
    if (!activeOrgId) return;
    try {
      await orgExtendedApi.completeOnboardingStep(activeOrgId, stepId);
      setSteps(prev => prev.map(s => s.id === stepId ? { ...s, completed: true } : s));
      toast.success("Step marked complete.");
    } catch (e: any) { toast.error(e?.response?.data?.detail || "Failed."); }
  };

  if (!activeOrgId) return null;

  const completed = steps.filter(s => s.completed).length;
  const pct = steps.length ? Math.round((completed / steps.length) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        eyebrow="Admin"
        title="Onboarding checklist"
        subtitle="Set up the things that pay off: brand, SSO, first team, automations, billing."
      />

      <GlassCard padding={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: tokens.DISPLAY_STACK, fontSize: 28, fontWeight: 700 }}>{completed} / {steps.length}</span>
          <span style={{ fontSize: 13, color: tokens.SLATE_500 }}>{pct}% complete</span>
        </div>
        <div style={{ background: tokens.SLATE_100, borderRadius: 999, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${tokens.PURPLE} 0%, ${tokens.SKY} 100%)`, borderRadius: 999, transition: "width 320ms ease" }} />
        </div>
      </GlassCard>

      {loading ? <GlassCard padding={20}><Skeleton height={20} /></GlassCard> :
        steps.length === 0 ? <OrbEmptyState title="No checklist" body="The setup checklist is generated for new workspaces. Reach out to support if you need it refreshed." /> :
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {steps.map((s, i) => (
            <motion.div key={s.id} {...STAGGER_FAST(i)}>
              <GlassCard padding={16} style={{ opacity: s.completed ? 0.65 : 1 }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                  {s.completed ? <CheckCircle2 size={20} color={tokens.GREEN} /> : <Circle size={20} color={tokens.SLATE_400} />}
                  <div>
                    <div style={{ fontWeight: 700, color: tokens.INK, fontSize: 14, textDecoration: s.completed ? "line-through" : "none" }}>{s.title}</div>
                    {s.description && <div style={{ fontSize: 12, color: tokens.SLATE_600, marginTop: 4 }}>{s.description}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {s.href && <Button tone="outline" size="sm" onClick={() => navigate(s.href!)}>Open <ArrowRight size={12} /></Button>}
                    {!s.completed && <Button tone="ghost" size="sm" onClick={() => complete(s.id)}>Mark done</Button>}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>}
    </div>
  );
};

export default AdminOnboardingChecklist;
