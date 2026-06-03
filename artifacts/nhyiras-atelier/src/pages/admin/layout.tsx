import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, MessageSquare, LogOut } from "lucide-react";
import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: session, isLoading, isError } = useGetAdminMe();
  const logout = useAdminLogout();

  useEffect(() => {
    if (!isLoading && (isError || !session?.authenticated)) {
      setLocation("/admin");
    }
  }, [session, isLoading, isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <span className="text-[13px] text-[#9CA3AF] font-sans tracking-wide">Loading…</span>
      </div>
    );
  }

  if (!session?.authenticated) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin"),
    });
  };

  const navItem = (href: string, icon: React.ReactNode, label: string) => {
    const active = location === href;
    return (
      <Link href={href}>
        <div className={`flex items-center gap-2.5 px-3 py-[7px] rounded-lg cursor-pointer transition-colors duration-150 text-[13px] ${
          active
            ? "bg-[#F0FAFA] text-[#0D6E6E] font-medium"
            : "text-[#6B7280] hover:bg-[#F5F5F5] font-normal"
        }`}>
          <span className={active ? "text-[#0D6E6E]" : "text-[#BEBEBE]"}>{icon}</span>
          {label}
        </div>
      </Link>
    );
  };

  const cardH = "calc(100vh - 24px)";

  return (
    <div className="min-h-screen bg-[#E6E6E6] p-3 flex gap-2.5 font-sans items-start">

      {/* ── Sidebar card ── */}
      <aside
        className="w-[210px] shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden"
        style={{ height: cardH }}
      >
        {/* Brand */}
        <div className="px-5 pt-5 pb-4">
          <span className="font-brand text-[28px] text-[#C9A84C] leading-tight block">Nhyira's</span>
          <span className="font-label text-[8px] tracking-[0.28em] text-[#0A4F4F] uppercase block mt-0.5">ATELIER</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-1 space-y-5 overflow-y-auto">
          <div className="space-y-0.5">
            <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Overview</p>
            {navItem("/admin/dashboard", <LayoutDashboard size={14} />, "Dashboard")}
          </div>

          <div className="space-y-0.5">
            <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Manage</p>
            {navItem("/admin/portfolio", <ImageIcon size={14} />, "Portfolio")}
            {navItem("/admin/enquiries", <MessageSquare size={14} />, "Enquiries")}
          </div>

          <div className="space-y-0.5">
            <p className="px-3 py-1 text-[10px] font-medium tracking-widest text-[#CECECE] uppercase">Settings</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-[7px] w-full text-left text-[#6B7280] hover:bg-[#F5F5F5] transition-colors duration-150 rounded-lg text-[13px] font-normal"
            >
              <LogOut size={14} className="text-[#BEBEBE]" />
              Logout
            </button>
          </div>
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-[#F0F0F0]">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F8F8F8] transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-[12px] font-medium shrink-0">
              N
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-medium text-[#111827] truncate leading-tight">Nhyira</span>
              <span className="text-[11px] text-[#AFAFAF] truncate leading-tight">nhyiras_atelier</span>
            </div>
            <span className="shrink-0 text-[9px] font-medium tracking-wide text-[#0D6E6E] bg-[#EDF7F7] px-2 py-0.5 rounded-full uppercase">
              Studio
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main content card ── */}
      <main
        className="flex-1 bg-white rounded-2xl overflow-y-auto"
        style={{ height: cardH }}
      >
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
