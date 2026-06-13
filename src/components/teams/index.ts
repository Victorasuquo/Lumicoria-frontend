/**
 * Teams component barrel.
 *
 * Canonical re-exports for the team-management surface so pages under
 * /workspace/teams/* don't have to import the workspace primitives
 * directly.  Keeps the public surface stable while the underlying file
 * layout evolves.
 */

export { default as MemberRowActions } from "@/components/workspace/MemberRowActions";
export { default as InviteDialog } from "@/components/workspace/InviteDialog";
export { default as AvatarUpload } from "@/components/workspace/AvatarUpload";
export { default as CoverUpload } from "@/components/workspace/CoverUpload";
export { default as MemberAvatarEditable } from "@/components/workspace/MemberAvatarEditable";
export { GlassCard, SectionHeader, BrandPill, RoleChip, MemberAvatar, MemberStack, Button, Input, EmptyState, Skeleton } from "@/components/workspace/primitives";
