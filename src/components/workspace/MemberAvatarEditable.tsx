/**
 * MemberAvatarEditable — renders MemberAvatar, but if the row belongs to
 * the currently-signed-in user, swap it for an AvatarUpload so they can
 * change their own picture in-place from any roster.
 *
 * Falls back transparently to the static MemberAvatar otherwise, so it's
 * safe to drop into team/project/workspace member tables.
 */

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MemberAvatar } from "@/components/workspace/primitives";
import AvatarUpload from "@/components/workspace/AvatarUpload";

interface Props {
  userId?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  /** When the current user uploads, also refresh AuthContext so other
   * surfaces (sidebar, profile menu) pick up the new picture. */
  onSelfUpdated?: (url: string) => void;
}

export const MemberAvatarEditable: React.FC<Props> = ({ userId, name, avatarUrl, size = 36, onSelfUpdated }) => {
  const { user, refreshUser } = useAuth();
  const isSelf = !!user?.id && !!userId && String(user.id) === String(userId);
  if (!isSelf) {
    return <MemberAvatar name={name} src={avatarUrl} size={size} userId={userId} />;
  }
  return (
    <AvatarUpload
      scope="user"
      currentUrl={avatarUrl || (user as any)?.profile_picture || (user as any)?.avatar_url || null}
      fallbackName={name}
      size={size}
      rounded="full"
      onUploaded={(url) => {
        onSelfUpdated?.(url);
        // refresh AuthContext so the new avatar propagates to MainNav / WorkspaceLayout
        void refreshUser();
      }}
    />
  );
};

export default MemberAvatarEditable;
