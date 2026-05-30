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
    return <div className="min-h-screen bg-[#F9F5EE] flex items-center justify-center">Loading...</div>;
  }

  if (!session?.authenticated) {
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin")
    });
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Portfolio", href: "/admin/portfolio", icon: ImageIcon },
    { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-[220px] bg-[#F9F5EE] flex flex-col border-r border-[#0D6E6E]/10 rounded-r-[2rem] my-4 ml-0 shrink-0">
        <div className="p-8">
          <div className="flex flex-col items-start gap-1">
            <span className="font-brand text-2xl text-[#C9A84C]">Nhyira's</span>
            <span className="font-label text-[10px] tracking-widest text-[#0A4F4F]">ATELIER</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 rounded-full font-sans text-sm ${isActive ? "bg-[#0D6E6E] text-white" : "text-[#0A4F4F] hover:bg-[#0D6E6E]/10"}`}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mb-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-[#0A4F4F] hover:bg-[#0D6E6E]/10 transition-colors duration-200 rounded-full font-sans text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}