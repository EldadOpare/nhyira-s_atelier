import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Image as ImageIcon, MessageSquare, LogOut,
  PanelLeftClose, PanelLeftOpen, Menu, X, Tags,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdminPageProvider, useAdminPage } from "@/lib/admin-page-context";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/portfolio", icon: ImageIcon, label: "Portfolio" },
      { href: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
      { href: "/admin/categories", icon: Tags, label: "Categories" },
    ],
  },
];

function NavItem({
  href, icon: Icon, label, collapsed, onClick,
}: {
  href: string;
  icon: React.ElementType;
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
          className={`flex items-center rounded-[8px] transition-colors cursor-pointer ${
            collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5"
          } ${
            active
              ? "bg-[#0D6E6E]/10 text-[#0D6E6E]"
              : "text-[#6B7280] hover:bg-black/[0.04] hover:text-[#111827]"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">{label}</span>}
        </div>
      </Link>

      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-[6px] text-xs text-[#111827] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 admin-card">
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
      className={`fixed left-0 top-0 h-full bg-[#F3F3F1] z-40 flex flex-col transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Brand header */}
      <div className="relative flex flex-col items-center px-3 pt-6 pb-4 shrink-0">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-[8px] hover:bg-black/[0.05] transition-colors text-[#9CA3AF] lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>

        {collapsed ? (
          <span className="font-brand text-[26px] text-[#C9A84C] leading-none">N</span>
        ) : (
          <>
            <span className="font-brand text-[34px] text-[#C9A84C] leading-tight">Nhyira's</span>
            <span className="font-label text-[8px] tracking-[0.3em] text-[#0A4F4F]/50 uppercase mt-1">
              Atelier Admin
            </span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-3 ${collapsed ? "overflow-visible px-1.5" : "overflow-y-auto px-3"}`}>
        {collapsed ? (
          <div className="space-y-1">
            {NAV_SECTIONS.flatMap(s => s.items).map(item => (
              <NavItem key={item.href} {...item} collapsed onClick={onClose} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.12em] text-[#A8A29E] uppercase">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <NavItem key={item.href} {...item} collapsed={false} onClick={onClose} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer — user chip, logout, collapse toggle */}
      <div className={`pb-4 pt-2 shrink-0 flex flex-col gap-2 border-t border-black/[0.06] mt-2 ${collapsed ? "px-2 items-center" : "px-3"}`}>
        <div className={`flex items-center w-full pt-2 ${collapsed ? "justify-center" : "gap-2.5 px-1"}`}>
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

        {/* Logout */}
        <div className="relative group w-full">
          <button
            onClick={onLogout}
            className={`flex items-center rounded-[8px] text-[#6B7280] hover:bg-black/[0.04] hover:text-[#111827] transition-colors text-sm w-full ${
              collapsed ? "justify-center py-2.5" : "gap-3 px-3 py-2.5"
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-[6px] text-xs text-[#111827] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 admin-card">
              Logout
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-[8px] hover:bg-black/[0.05] transition-colors text-[#9CA3AF] hidden lg:flex ${collapsed ? "" : "self-end"}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
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
      <div className="min-h-screen bg-[#F3F3F1] flex items-center justify-center">
        <span className="text-[13px] text-[#AFAFAF] font-sans tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    signOut().then(() => setLocation("/admin"));
  };

  return (
    <div className="flex min-h-screen bg-[#F3F3F1] font-sans">
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

      {/* Outer frame — same bg as sidebar so the sidebar blends into the page,
          the white content card floats inside with a soft shadow. */}
      <div className={`flex-1 min-w-0 transition-all duration-200 p-3 ${
        collapsed ? "lg:ml-14" : "lg:ml-56"
      }`}>
        <div className="admin-float bg-white rounded-[12px] h-[calc(100vh-1.5rem)] flex flex-col overflow-hidden">

          {/* Mobile top bar */}
          <div className="sticky top-0 z-20 bg-white border-b border-[#F1F0EE] px-4 py-3 flex items-center gap-3 shrink-0 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-[#F5F5F5] rounded-[6px] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-[#6B7280]" />
            </button>
            <span className="font-brand text-xl text-[#C9A84C]">Nhyira's</span>
          </div>

          {/* Page header */}
          {header.title && (
            <div className="shrink-0 px-6 md:px-8 py-5 border-b border-[#F1F0EE] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-sans text-[20px] font-medium text-[#111827] tracking-tight leading-tight truncate">
                  {header.title}
                </h1>
                {header.subtitle && (
                  <p className="text-[12px] text-[#AFAFAF] mt-0.5 truncate">{header.subtitle}</p>
                )}
              </div>
              {header.action && <div className="shrink-0">{header.action}</div>}
            </div>
          )}

          {/* Scrollable content */}
          <main className="flex-1 min-h-0 overflow-y-auto bg-[#FAFAF9]">
            <div className="max-w-6xl mx-auto p-6 md:p-8">
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
