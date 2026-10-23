import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Image as ImageIcon, MessageSquare, LogOut,
  PanelLeftClose, PanelLeftOpen, Menu, X, Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
      <Link href={href} onClick={onClick}>
        <div
          className={cn(
            "flex items-center rounded-lg transition-colors cursor-pointer",
            collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5",
            active
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm">{label}</span>}
        </div>
      </Link>

      {collapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-card border border-border rounded-md text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
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
  const isMobile = useIsMobile();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-background z-40 flex flex-col transition-all duration-200",
        collapsed ? "w-14" : "w-56",
        isMobile && !isOpen && "-translate-x-full"
      )}
    >
      {/* Header — branding, fully centered */}
      <div className="relative flex flex-col items-center px-3 pt-5 pb-3 shrink-0">
        {isMobile && !collapsed && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {collapsed ? (
          <span className="font-brand text-[26px] text-[#C9A84C] leading-none">N</span>
        ) : (
          <>
            <span className="font-brand text-[44px] text-[#C9A84C] leading-tight">Nhyira's</span>
            <p className="text-sm font-medium text-foreground mt-1">Atelier Admin</p>
            <p className="text-[10px] tracking-[0.08em] uppercase text-muted-foreground/55">
              Management System
            </p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 py-2", collapsed ? "overflow-visible" : "overflow-y-auto")}>
        {collapsed ? (
          <div className="space-y-1 px-1.5">
            {NAV_SECTIONS.flatMap(s => s.items).map(item => (
              <NavItem key={item.href} {...item} collapsed onClick={() => isMobile && onClose()} />
            ))}
          </div>
        ) : (
          <div className="px-3 space-y-3">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
                <div className="mt-1 space-y-0.5">
                  {section.items.map(item => (
                    <NavItem key={item.href} {...item} collapsed={false} onClick={() => isMobile && onClose()} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 shrink-0 flex flex-col items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center rounded-lg hover:bg-muted transition-colors w-full outline-none",
                collapsed ? "justify-center p-1.5" : "gap-2.5 px-2 py-1.5"
              )}
              aria-label="Account menu"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-medium shrink-0">
                N
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-[12px] font-medium text-foreground truncate leading-tight">Nhyira</span>
                  <span className="text-[10px] text-muted-foreground/60 truncate leading-tight">nhyiras_atelier</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuItem onClick={onLogout} className="gap-2 cursor-pointer">
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
        {!collapsed && (
          <p className="text-[10px] text-center text-muted-foreground/60">© Nhyira's Atelier</p>
        )}
      </div>
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { user, isLoading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { header } = useAdminPage();

  useEffect(() => {
    document.documentElement.classList.add("admin-theme");
    return () => document.documentElement.classList.remove("admin-theme");
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="text-[13px] text-muted-foreground font-sans tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    signOut().then(() => setLocation("/admin"));
  };

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        onLogout={handleLogout}
      />

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Outer frame — same bg as the sidebar, creates the wrapping effect */}
      <div className={cn(
        "flex-1 min-w-0 transition-all duration-200 p-3",
        isMobile ? "p-0" : collapsed ? "md:ml-14" : "md:ml-56"
      )}>
        {/* Content card — fixed viewport height so the rounded bottom is always visible */}
        <div className={cn(
          "bg-white flex flex-col overflow-hidden shadow-[0_2px_12px_hsl(0_0%_72%_/_0.35)]",
          isMobile ? "h-screen" : "rounded-2xl h-[calc(100vh-1.5rem)]"
        )}>
          {isMobile && (
            <div className="sticky top-0 z-20 bg-white border-b border-border/60 px-4 py-3 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-brand text-xl text-[#C9A84C]">Nhyira's</span>
            </div>
          )}

          {/* Page header */}
          {header.title && (
            <div className="shrink-0 px-6 md:px-8 py-5 border-b border-border/60 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-medium text-foreground tracking-tight leading-tight truncate">
                  {header.title}
                </h1>
                {header.subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{header.subtitle}</p>
                )}
              </div>
              {header.action && <div className="shrink-0">{header.action}</div>}
            </div>
          )}

          {/* Scrollable content */}
          <main className="flex-1 min-h-0 overflow-y-auto">
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
