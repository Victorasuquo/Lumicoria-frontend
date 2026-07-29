import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bot, Brain, Building2, CreditCard, HeartPulse, Inbox, Mail, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orgs", label: "Organizations", icon: Building2 },
  { to: "/admin/agents", label: "Agents", icon: Bot },
  { to: "/admin/digest", label: "Daily Digest", icon: Brain },
  { to: "/admin/finance", label: "Finance", icon: CreditCard },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/email", label: "Email", icon: Mail },
  { to: "/admin/system", label: "System", icon: HeartPulse },
  { to: "/admin/audit", label: "Audit", icon: ShieldCheck },
];

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F7F4EF] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-black/10 bg-white/85 p-5 lg:block">
        <button onClick={() => navigate("/dashboard")} className="mb-8 text-left">
          <div className="text-xs font-black uppercase tracking-[0.26em] text-[#6C4AB0]">Lumicoria</div>
          <div className="mt-1 text-2xl font-black tracking-tight">Admin Portal</div>
        </button>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-[#6C4AB0] text-white shadow-lg shadow-purple-900/15" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Signed in as<br />
          <span className="font-bold text-slate-800">{user?.email}</span>
        </div>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {links.map(({ to, label, end }) => (
              <NavLink key={to} end={end} to={to} className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${isActive ? "bg-[#6C4AB0] text-white" : "bg-white text-slate-600"}`}>
                {label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
