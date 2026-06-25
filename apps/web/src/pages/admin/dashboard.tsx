import { useEffect, useState } from "react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAdminPage } from "@/lib/admin-page-context";
import { Inbox, BellDot, CalendarCheck, ImageIcon } from "lucide-react";
import { EnquiryDetailDialog } from "@/components/admin/enquiry-detail-dialog";

function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    new:      "bg-blue-50 text-blue-600",
    read:     "bg-[#F5F5F5] text-[#6B7280]",
    replied:  "bg-purple-50 text-purple-600",
    booked:   "bg-emerald-50 text-emerald-600",
    archived: "bg-[#F5F5F5] text-[#AFAFAF]",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${colours[status] ?? "bg-[#F5F5F5] text-[#9CA3AF]"}`}>
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();
  const { setHeader } = useAdminPage();
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

  useEffect(() => {
    setHeader({ title: "Overview", subtitle: "Welcome back, Nhyira" });
  }, [setHeader]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 bg-white rounded-[6px] border border-[#E7E5E4]" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Enquiries", value: stats.totalEnquiries, icon: Inbox },
    { label: "New",             value: stats.newEnquiries,   icon: BellDot },
    { label: "Booked",          value: stats.bookedEnquiries, icon: CalendarCheck },
    { label: "Portfolio Items", value: stats.totalPortfolioItems, icon: ImageIcon },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Stat Cards */}
      <div>
        <p className="text-[11px] font-medium tracking-[0.1em] text-[#A8A29E] uppercase mb-3">Key Metrics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon }, idx) => (
            <div
              key={label}
              className="animate-admin-fade-up admin-card bg-white border border-[#E7E5E4] rounded-[6px] p-5 flex flex-col justify-between h-28"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-[0.1em]">{label}</p>
                <Icon className="h-4 w-4 text-[#0D6E6E]" />
              </div>
              <p className="text-[32px] font-medium text-[#111827] leading-none">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Enquiries */}
        <div className="animate-admin-fade-up admin-card lg:col-span-2 bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden" style={{ animationDelay: "240ms" }}>
          <div className="px-6 py-4 border-b border-[#F1F0EE]">
            <h2 className="text-[13px] font-medium text-[#111827]">Recent Enquiries</h2>
          </div>
          {!stats.recentEnquiries?.length ? (
            <p className="p-6 text-[#AFAFAF] text-[13px]">No recent enquiries.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block divide-y divide-[#F1F0EE]">
                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider">
                  <div className="col-span-5">Client</div>
                  <div className="col-span-4">Service</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} onClick={() => setSelectedEnquiry(enq)}
                    className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-[#FAFAF9] transition-colors cursor-pointer">
                    <div className="col-span-5">
                      <p className="text-[13px] font-medium text-[#111827]">{enq.name}</p>
                      <p className="text-[11px] text-[#BEBEBE] mt-0.5">{format(new Date(enq.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-[13px] text-[#6B7280] truncate">{enq.service}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <StatusBadge status={enq.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[#F1F0EE]">
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} onClick={() => setSelectedEnquiry(enq)}
                    className="px-5 py-4 flex items-start justify-between gap-3 cursor-pointer active:bg-[#F1F0EE]">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-[#111827] truncate">{enq.name}</p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">{enq.service}</p>
                      <p className="text-[11px] text-[#BEBEBE] mt-0.5">{format(new Date(enq.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <StatusBadge status={enq.status} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* By Service */}
        <div className="animate-admin-fade-up admin-card bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden" style={{ animationDelay: "320ms" }}>
          <div className="px-6 py-4 border-b border-[#F1F0EE]">
            <h2 className="text-[13px] font-medium text-[#111827]">By Service</h2>
          </div>
          <div className="p-6">
            {!stats.enquiriesByService?.length ? (
              <p className="text-[#AFAFAF] text-[13px]">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.enquiriesByService.map((item) => (
                  <div key={item.service} className="flex justify-between items-center">
                    <span className="text-[13px] text-[#4B5563] truncate pr-4">{item.service}</span>
                    <span className="text-[13px] font-medium text-[#0D6E6E] bg-[#0D6E6E]/[0.08] px-2.5 py-0.5 rounded-[8px] min-w-[28px] text-center">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shared enquiry detail modal */}
      <EnquiryDetailDialog enquiry={selectedEnquiry} onClose={() => setSelectedEnquiry(null)} />
    </div>
  );
}
