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
    return <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">Loading...</div>;
  }

  if (!session?.authenticated) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin")
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex font-sans">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-[220px] h-[100vh] bg-[#FFFFFF] flex flex-col border-r border-[#E5E5E5] shrink-0">
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col items-start gap-0">
            <span className="font-brand text-3xl text-[#C9A84C] leading-tight">Nhyira's</span>
            <span className="font-label text-[9px] tracking-[0.25em] text-[#0A4F4F] uppercase mt-0.5">ATELIER</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Group 1 */}
          <div className="space-y-1">
            <h3 className="px-3 mb-2 text-[10px] font-medium tracking-widest text-[#9CA3AF] uppercase">OVERVIEW</h3>
            <Link href="/admin/dashboard">
              <div className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-200 rounded-lg text-[13px] font-medium ${location === "/admin/dashboard" ? "bg-[#F0FAFA] text-[#0D6E6E]" : "text-[#4B5563] hover:bg-gray-50"}`}>
                <LayoutDashboard size={16} className={location === "/admin/dashboard" ? "text-[#0D6E6E]" : "text-[#9CA3AF]"} />
                <span>Dashboard</span>
              </div>
            </Link>
          </div>

          {/* Group 2 */}
          <div className="space-y-1">
            <h3 className="px-3 mb-2 text-[10px] font-medium tracking-widest text-[#9CA3AF] uppercase">MANAGE</h3>
            <Link href="/admin/portfolio">
              <div className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-200 rounded-lg text-[13px] font-medium ${location === "/admin/portfolio" ? "bg-[#F0FAFA] text-[#0D6E6E]" : "text-[#4B5563] hover:bg-gray-50"}`}>
                <ImageIcon size={16} className={location === "/admin/portfolio" ? "text-[#0D6E6E]" : "text-[#9CA3AF]"} />
                <span>Portfolio</span>
              </div>
            </Link>
            <Link href="/admin/enquiries">
              <div className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors duration-200 rounded-lg text-[13px] font-medium ${location === "/admin/enquiries" ? "bg-[#F0FAFA] text-[#0D6E6E]" : "text-[#4B5563] hover:bg-gray-50"}`}>
                <MessageSquare size={16} className={location === "/admin/enquiries" ? "text-[#0D6E6E]" : "text-[#9CA3AF]"} />
                <span>Enquiries</span>
              </div>
            </Link>
          </div>

          {/* Group 3 */}
          <div className="space-y-1">
            <h3 className="px-3 mb-2 text-[10px] font-medium tracking-widest text-[#9CA3AF] uppercase">SETTINGS</h3>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-[#4B5563] hover:bg-gray-50 transition-colors duration-200 rounded-lg text-[13px] font-medium"
            >
              <LogOut size={16} className="text-[#9CA3AF]" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-[#EBEBEB]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#0D6E6E] text-white flex items-center justify-center text-xs font-medium shrink-0">
              N
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#111827] truncate">Nhyira</span>
              <span className="text-[11px] text-[#6B7280] truncate">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[220px] p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}