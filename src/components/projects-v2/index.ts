/**
 * Projects v2 component barrel.
 *
 * Stable import surface for the project-management UI (board, members,
 * agents, activity).  Re-exports the shared workspace pieces under a
 * project-scoped namespace.
 */

export { default as TaskCreateDialog } from "@/components/workspace/TaskCreateDialog";
export { default as MemberRowActions } from "@/components/workspace/MemberRowActions";
export { default as InviteDialog } from "@/components/workspace/InviteDialog";
export { default as AvatarUpload } from "@/components/workspace/AvatarUpload";
export { default as CoverUpload } from "@/components/workspace/CoverUpload";
export { default as MemberAvatarEditable } from "@/components/workspace/MemberAvatarEditable";
export { GlassCard, SectionHeader, BrandPill, RoleChip, AgentChip, MemberAvatar, MemberStack, Button, Input, EmptyState, Skeleton } from "@/components/workspace/primitives";
