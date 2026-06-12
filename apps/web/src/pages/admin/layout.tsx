import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Image as ImageIcon, MessageSquare, LogOut,
  PanelLeftClose, PanelLeftOpen, Menu, X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdminPageProvider, useAdminPage } from "@/lib/admin-page-context";

function NavItem({
  href, icon, label, collapsed, onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const [location] = useLocation();
  const active = location === href;

  return (
    <div className="relative group">
      <Link href={href}>
        <div
          onClick={onClick}
          className={`flex items-center rounded-lg cursor-pointer transition-colors duration-150 text-[13px] ${
            collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-[#EAF5F5] text-[#0D6E6E] font-medium"
              : "text-[#6B7280] hover:bg-black/5 font-normal"
          }`}
        >
          <span className={`shrink-0 ${active ? "text-[#0D6E6E]" : "text-[#BEBEBE]"}`}>{icon}</span>
          {!collapsed && <span>{label}</span>}
        </div>
      </Link>

      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#111827] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
          {label}
        </div>
      )}
    </div>
  );
}

function AdminSidebar({
  isOpen, onClose, collapsed, onToggleCollapse, onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#F2EDE7] z-40 flex flex-col transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Header */}
      <div className="relative flex flex-col items-center px-3 pt-5 pb-3 shrink-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 transition-colors text-[#9CA3AF] lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>

        {collapsed ? (
          <span className="font-brand text-[24px] text-[#C9A84C] leading-none">N</span>
        ) : (
          <>
            <span className="font-brand text-[32px] text-[#C9A84C] leading-tight">Nhyira's</span>
            <span className="font-label text-[8px] tracking-[0.28em] text-[#0A4F4F]/50 uppercase mt-0.5">
              Atelier Admin
            </span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-2 ${collapsed ? "overflow-visible" : "overflow-y-auto"}`}>
        {collapsed ? (
          <div className="space-y-1 px-1.5">
            <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" collapsed onClick={onClose} />
            <NavItem href="/admin/portfolio"  icon={<ImageIcon size={14} />}       label="Portfolio"  collapsed onClick={onClose} />
            <NavItem href="/admin/enquiries"  icon={<MessageSquare size={14} />}   label="Enquiries"  collapsed onClick={onClose} />
            <div className="relative group">
              <button
                onClick={onLogout}
                className="flex items-center justify-center mx-1 py-2.5 w-[calc(100%-8px)] rounded-lg text-[#6B7280] hover:bg-black/5 transition-colors"
              >
                <LogOut size={14} className="text-[#BEBEBE] shrink-0" />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-white border border-[#E5E7EB] rounded-md text-xs text-[#111827] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                Logout
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 space-y-3">
            <div>
              <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#C0BAB3] uppercase">Overview</p>
              <div className="space-y-0.5">
                <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" collapsed={false} onClick={onClose} />
              </div>
            </div>

            <div>
              <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#C0BAB3] uppercase">Manage</p>
              <div className="space-y-0.5">
                <NavItem href="/admin/portfolio" icon={<ImageIcon size={14} />}     label="Portfolio"  collapsed={false} onClick={onClose} />
                <NavItem href="/admin/enquiries" icon={<MessageSquare size={14} />} label="Enquiries"  collapsed={false} onClick={onClose} />
              </div>
            </div>

            <div>
              <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#C0BAB3] uppercase">Settings</p>
              <div className="space-y-0.5">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-[#6B7280] hover:bg-black/5 transition-colors duration-150 rounded-lg text-[13px] font-normal w-full"
                >
                  <LogOut size={14} className="text-[#BEBEBE] shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Footer — user chip + collapse toggle */}
      <div className={`pb-4 pt-2 shrink-0 flex flex-col items-center gap-2 ${collapsed ? "px-2" : "px-3"}`}>
        <div className={`flex items-center w-full ${collapsed ? "justify-center" : "gap-2.5 px-1"}`}>
          <div className="w-7 h-7 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-[11px] font-medium shrink-0">
            N
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-medium text-[#111827] truncate leading-tight">Nhyira</span>
              <span className="text-[10px] text-[#AFAFAF] truncate leading-tight">nhyiras_atelier</span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-[#9CA3AF] hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen className="h-4 w-4" />
            : <PanelLeftClose className="h-4 w-4" />
          }
        </button>
      </div>
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isLoading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { header } = useAdminPage();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2EDE7] flex items-center justify-center">
        <span className="text-[13px] text-[#AFAFAF] font-sans tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    signOut().then(() => setLocation("/admin"));
  };

  return (
    <div className="flex min-h-screen bg-[#F2EDE7]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onLogout={handleLogout}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Outer frame — same bg as sidebar so sidebar blends in */}
      <div className={`flex-1 min-w-0 transition-all duration-200 p-3 ${
        collapsed ? "lg:ml-14" : "lg:ml-56"
      }`}>
        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)] h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden">

          {/* Mobile top bar */}
          <div className="sticky top-0 z-20 bg-white border-b border-[#F0F0F0] px-4 py-3 flex items-center gap-3 shrink-0 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[#F5F5F5] rounded-md transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-[#6B7280]" />
            </button>
            <span className="font-brand text-xl text-[#C9A84C]">Nhyira's</span>
          </div>

          {/* Page header */}
          {header.title && (
            <div className="shrink-0 px-8 py-5 border-b border-[#F0F0F0] flex items-center justify-between">
              <div>
                <h1 className="text-[20px] font-medium text-[#111827] tracking-tight leading-tight">
                  {header.title}
                </h1>
                {header.subtitle && (
                  <p className="text-[12px] text-[#AFAFAF] mt-0.5">{header.subtitle}</p>
                )}
              </div>
              {header.action && <div>{header.action}</div>}
            </div>
          )}

          {/* Scrollable content */}
          <main className="flex-1 min-h-0 overflow-y-auto bg-[#F8F7F5]">
            <div className="max-w-5xl mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
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
