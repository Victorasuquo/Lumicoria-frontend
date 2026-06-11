/**
 * MemberRowActions — small "..." dropdown attached to a member row.
 *
 * Lets a viewer change the member's role and remove them.  Works for
 * both team and project scopes by passing the matching API helpers.
 */

import React, { useEffect, useRef, useState } from "react";

interface ActionProps {
  currentRole: string;
  roleChoices: string[];
  onChangeRole: (newRole: string) => Promise<void>;
  onRemove: () => Promise<void>;
  disabled?: boolean;
}

export const MemberRowActions: React.FC<ActionProps> = ({
  currentRole, roleChoices, onChangeRole, onRemove, disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const change = async (next: string) => {
    setBusy(true);
    try { await onChangeRole(next); setOpen(false); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm("Remove this member?")) return;
    setBusy(true);
    try { await onRemove(); setOpen(false); }
    finally { setBusy(false); }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled || busy}
        aria-label="Member actions"
        className="px-2 py-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="3" cy="8" r="1.4" fill="currentColor" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="13" cy="8" r="1.4" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50"
        >
          <div className="px-3 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Change role</div>
          {roleChoices.map(r => (
            <button
              key={r}
              onClick={() => change(r)}
              disabled={busy || r === currentRole}
              className="block w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:bg-transparent"
            >
              {r.replace(/_/g, " ")}
              {r === currentRole && <span className="ml-2 text-[10px] text-slate-400">current</span>}
            </button>
          ))}
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={remove}
            disabled={busy}
            className="block w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Remove from team
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberRowActions;
