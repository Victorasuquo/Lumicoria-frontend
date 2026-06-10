/**
 * PlanCapToast — catches the structured 402 the backend returns from
 * `assert_can_add_seat` / `assert_can_create_custom_agent` etc. and
 * surfaces an upsell that lands the user on the billing page.
 *
 * Usage:
 *
 *   try {
 *     await orgBillingApi.assignSeat(orgId, userId);
 *   } catch (err) {
 *     if (isPlanCapError(err)) {
 *       showPlanCapToast(err, navigate);
 *       return;
 *     }
 *     throw err;
 *   }
 *
 * The shape it expects:
 *   { detail: { cap, current, limit, plan, upgrade_suggested, message } }
 */

import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

interface PlanCapDetail {
  cap: string;
  current: number;
  limit: number;
  plan: string;
  upgrade_suggested?: string | null;
  message: string;
}

export interface PlanCapError {
  response?: {
    status: number;
    data?: { detail?: PlanCapDetail };
  };
}

export function isPlanCapError(err: unknown): err is PlanCapError {
  const r = (err as PlanCapError)?.response;
  if (!r || r.status !== 402) return false;
  const d = r.data?.detail as PlanCapDetail | undefined;
  return Boolean(d && d.cap && d.message);
}

export function showPlanCapToast(err: PlanCapError, navigate?: NavigateFunction): void {
  const detail = err.response?.data?.detail;
  if (!detail) return;
  const action = navigate
    ? {
        label: detail.upgrade_suggested
          ? `Upgrade to ${detail.upgrade_suggested.charAt(0).toUpperCase() + detail.upgrade_suggested.slice(1)}`
          : "Open billing",
        onClick: () => navigate("/workspace/admin/billing"),
      }
    : undefined;

  toast.error(detail.message, {
    description: detail.upgrade_suggested
      ? `${detail.cap} cap reached on the ${detail.plan} plan. Upgrade unlocks more.`
      : `${detail.cap} cap reached on the ${detail.plan} plan.`,
    duration: 8000,
    action,
  });
}
