import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, MessageSquare, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import { AdminPageProvider, useAdminPage } from "@/lib/admin-page-context";

function AdminShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading, isError } = useGetAdminMe();
  const logout = useAdminLogout();
  const [collapsed, setCollapsed] = useState(false);
  const { header } = useAdminPage();

  useEffect(() => {
    if (!isLoading && (isError || !session?.authenticated)) {
      setLocation("/admin");
    }
  }, [session, isLoading, isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <span className="text-[13px] text-[#AFAFAF] font-sans tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!session?.authenticated) return null;

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => setLocation("/admin") });
  };

  const navItem = (href: string, icon: React.ReactNode, label: string) => {
    const active = location === href;
    return (
      <Link href={href}>
        <div title={collapsed ? label : undefined} className={`flex items-center rounded-lg cursor-pointer transition-colors duration-150 text-[13px] ${
          collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-[7px]"
        } ${active ? "bg-[#F0FAFA] text-[#0D6E6E] font-medium" : "text-[#6B7280] hover:bg-[#F5F5F5] font-normal"}`}>
          <span className={`shrink-0 ${active ? "text-[#0D6E6E]" : "text-[#BEBEBE]"}`}>{icon}</span>
          {!collapsed && <span>{label}</span>}
        </div>
      </Link>
    );
  };

  const cardH = "calc(100vh - 24px)";
  const sideW = collapsed ? "64px" : "210px";

  return (
    <div className="min-h-screen bg-[#E6E6E6] p-3 flex gap-2.5 font-sans items-start">

      {/* ── Sidebar card ── */}
      <aside
        className="shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300"
        style={{ width: sideW, height: cardH }}
      >
        {/* Brand + toggle */}
        <div className={`flex items-start pt-5 pb-4 ${collapsed ? "justify-center px-0 flex-col items-center gap-3" : "px-5 justify-between"}`}>
          {collapsed ? (
            <>
              <span className="font-brand text-[22px] text-[#C9A84C] leading-none">N</span>
              <button onClick={() => setCollapsed(false)} className="text-[#CECECE] hover:text-[#9CA3AF] transition-colors">
                <PanelLeftOpen size={14} />
              </button>
            </>
          ) : (
            <>
              <div>
                <span className="font-brand text-[28px] text-[#C9A84C] leading-tight block">Nhyira's</span>
                <span className="font-label text-[8px] tracking-[0.28em] text-[#0A4F4F] uppercase block mt-0.5">ATELIER</span>
              </div>
              <button onClick={() => setCollapsed(true)} className="mt-1 text-[#CECECE] hover:text-[#9CA3AF] transition-colors shrink-0">
                <PanelLeftClose size={14} />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 pt-1 space-y-5 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          <div className="space-y-0.5">
            {!collapsed && <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Overview</p>}
            {navItem("/admin/dashboard", <LayoutDashboard size={14} />, "Dashboard")}
          </div>

          <div className="space-y-0.5">
            {!collapsed && <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Manage</p>}
            {navItem("/admin/portfolio", <ImageIcon size={14} />, "Portfolio")}
            {navItem("/admin/enquiries", <MessageSquare size={14} />, "Enquiries")}
          </div>

          <div className="space-y-0.5">
            {!collapsed && <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Settings</p>}
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={`flex items-center text-[#6B7280] hover:bg-[#F5F5F5] transition-colors duration-150 rounded-lg text-[13px] font-normal w-full ${
                collapsed ? "justify-center py-2.5 px-0" : "gap-2.5 px-3 py-[7px]"
              }`}
            >
              <LogOut size={14} className="text-[#BEBEBE] shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </nav>

        {/* User card */}
        <div className={`border-t border-[#F0F0F0] ${collapsed ? "p-2" : "p-3"}`}>
          <div className={`flex items-center rounded-xl hover:bg-[#F8F8F8] transition-colors cursor-default ${
            collapsed ? "justify-center py-2" : "gap-2.5 px-2 py-2"
          }`}>
            <div className="w-8 h-8 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-[12px] font-medium shrink-0">N</div>
            {!collapsed && (
              <>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-[#111827] truncate leading-tight">Nhyira</span>
                  <span className="text-[11px] text-[#AFAFAF] truncate leading-tight">nhyiras_atelier</span>
                </div>
                <span className="shrink-0 text-[9px] font-medium tracking-wide text-[#0D6E6E] bg-[#EDF7F7] px-2 py-0.5 rounded-full uppercase">Studio</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content card ── */}
      <div
        className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden"
        style={{ height: cardH }}
      >
        {/* Sticky page header */}
        {header.title && (
          <div className="shrink-0 px-8 py-5 border-b border-[#F0F0F0] flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-medium text-[#111827] tracking-tight leading-tight">{header.title}</h1>
              {header.subtitle && <p className="text-[12px] text-[#AFAFAF] mt-0.5">{header.subtitle}</p>}
            </div>
            {header.action && <div>{header.action}</div>}
          </div>
        )}

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-[#F8F8F8]">
          <div className="max-w-5xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminPageProvider>
      <AdminShell>{children}</AdminShell>
    </AdminPageProvider>
  );
}
