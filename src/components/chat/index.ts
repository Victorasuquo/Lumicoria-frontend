/**
 * Chat (v2) component barrel.  Re-exports the shared workspace chat
 * panel and adjacent primitives so chat surfaces don't reach into
 * workspace/* directly.
 */

export { default as ChatPanel } from "@/components/workspace/ChatPanel";
export { GlassCard, BrandPill, MemberAvatar, Button, Input, EmptyState } from "@/components/workspace/primitives";
