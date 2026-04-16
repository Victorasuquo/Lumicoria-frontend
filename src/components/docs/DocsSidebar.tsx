import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import * as Icons from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { docsNavigation } from "@/data/docs/navigation";
import type { SidebarNavGroup, SidebarNavItem } from "@/data/docs/types";

// Resolve a lucide icon name string to the component
const getIcon = (name?: string, size = 14) => {
  if (!name) return null;
  const IconComp = (Icons as Record<string, React.FC<{ size?: number; className?: string }>>)[name];
  return IconComp ? <IconComp size={size} className="shrink-0" /> : null;
};

const NavItem: React.FC<{ item: SidebarNavItem; onNavigate?: () => void }> = ({ item, onNavigate }) => {
  const { pathname } = useLocation();
  const href = `/docs/${item.slug}`;
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-md transition-colors ${
        isActive
          ? "bg-purple-50 text-lumicoria-purple font-medium border-l-2 border-lumicoria-purple -ml-[2px]"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {item.icon && <span className="text-gray-400">{getIcon(item.icon, 13)}</span>}
      <span className="truncate">{item.title}</span>
    </Link>
  );
};

const NavGroup: React.FC<{ group: SidebarNavGroup; onNavigate?: () => void }> = ({ group, onNavigate }) => {
  const { pathname } = useLocation();
  const isGroupActive = group.children.some((c) => {
    const href = `/docs/${c.slug}`;
    return pathname === href || pathname.startsWith(href + "/");
  });
  const [open, setOpen] = useState(isGroupActive || !group.expandable);

  if (!group.expandable) {
    return (
      <div className="mb-4">
        <p className="px-3 mb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {group.title}
        </p>
        <div className="space-y-0.5">
          {group.children.map((item) => (
            <NavItem key={item.slug} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-4">
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
        <span className="flex items-center gap-2">
          {getIcon(group.icon, 13)}
          {group.title}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1">
        <div className="space-y-0.5">
          {group.children.map((item) => (
            <NavItem key={item.slug} item={item} onNavigate={onNavigate} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

const SidebarContent: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <div className="py-6 px-2">
    <Link to="/docs" onClick={onNavigate} className="flex items-center gap-2 px-3 mb-6">
      <span className="text-lg font-light text-gray-900">
        <span className="italic">Lumi</span>
        <span className="font-medium">coria</span>
        <span className="text-lumicoria-purple">.docs</span>
      </span>
    </Link>
    {docsNavigation.map((group) => (
      <NavGroup key={group.slug} group={group} onNavigate={onNavigate} />
    ))}
  </div>
);

// ── Desktop sidebar ──────────────────────────────────────────────

export const DesktopSidebar: React.FC = () => (
  <aside className="hidden lg:block w-[280px] shrink-0 border-r border-gray-100">
    <ScrollArea className="h-[calc(100vh-4rem)] sticky top-16">
      <SidebarContent />
    </ScrollArea>
  </aside>
);

// ── Mobile sidebar (Sheet drawer) ────────────────────────────────

export const MobileSidebarTrigger: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden border-b border-gray-100 px-4 py-2 bg-white sticky top-16 z-20">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Menu size={16} />
            <span>Documentation menu</span>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <ScrollArea className="h-full">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};
