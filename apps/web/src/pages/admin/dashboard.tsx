import { useEffect } from "react";
import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useAdminPage } from "@/lib/admin-page-context";

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

  useEffect(() => {
    setHeader({ title: "Overview", subtitle: "Welcome back, Nhyira" });
  }, [setHeader]);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 font-sans">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 bg-white rounded-xl border border-[#EBEBEB]" />)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Enquiries", value: stats.totalEnquiries },
    { label: "New",             value: stats.newEnquiries },
    { label: "Booked",          value: stats.bookedEnquiries },
    { label: "Portfolio Items", value: stats.totalPortfolioItems },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#EBEBEB] rounded-xl p-5 flex flex-col justify-between h-28">
            <p className="text-[10px] font-medium text-[#BEBEBE] uppercase tracking-wider">{label}</p>
            <p className="text-[32px] font-medium text-[#111827] leading-none">{value}</p>
          </div>
        ))}
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F2F2F2]">
            <h2 className="text-[13px] font-medium text-[#111827]">Recent Enquiries</h2>
          </div>
          {!stats.recentEnquiries?.length ? (
            <p className="p-6 text-[#AFAFAF] text-[13px]">No recent enquiries.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block divide-y divide-[#F5F5F5]">
                <div className="grid grid-cols-12 gap-4 px-6 py-2.5 text-[10px] font-medium text-[#CECECE] uppercase tracking-wider">
                  <div className="col-span-5">Client</div>
                  <div className="col-span-4">Service</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-[#FAFAFA] transition-colors">
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
              <div className="sm:hidden divide-y divide-[#F5F5F5]">
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} className="px-5 py-4 flex items-start justify-between gap-3">
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
        <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F2F2F2]">
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
                    <span className="text-[13px] font-medium text-[#111827] bg-[#F5F5F5] px-2.5 py-0.5 rounded-lg min-w-[28px] text-center">{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
