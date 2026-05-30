import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8 font-sans">
        <h1 className="text-2xl font-medium text-[#111827]">Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-white rounded-2xl border border-[#EBEBEB]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-[#111827]">Overview</h1>
        <p className="text-[13px] text-[#6B7280]">Welcome back, Nhyira</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#EBEBEB] rounded-2xl flex flex-col justify-between h-32">
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">TOTAL ENQUIRIES</p>
          <p className="text-3xl font-medium text-[#111827]">{stats.totalEnquiries}</p>
        </div>
        <div className="bg-white p-6 border border-[#EBEBEB] rounded-2xl flex flex-col justify-between h-32">
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">NEW ENQUIRIES</p>
          <p className="text-3xl font-medium text-[#111827]">{stats.newEnquiries}</p>
        </div>
        <div className="bg-white p-6 border border-[#EBEBEB] rounded-2xl flex flex-col justify-between h-32">
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">BOOKED</p>
          <p className="text-3xl font-medium text-[#111827]">{stats.bookedEnquiries}</p>
        </div>
        <div className="bg-white p-6 border border-[#EBEBEB] rounded-2xl flex flex-col justify-between h-32">
          <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">PORTFOLIO ITEMS</p>
          <p className="text-3xl font-medium text-[#111827]">{stats.totalPortfolioItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-[#EBEBEB]">
            <h2 className="text-[15px] font-medium text-[#111827]">Recent Enquiries</h2>
          </div>
          <div className="p-0">
            {!stats.recentEnquiries?.length ? (
              <p className="p-6 text-[#6B7280] text-[13px]">No recent enquiries.</p>
            ) : (
              <div className="divide-y divide-[#EBEBEB]">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
                  <div className="col-span-5">Client</div>
                  <div className="col-span-4">Service</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-5">
                      <p className="text-[13px] font-medium text-[#111827]">{enq.name}</p>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">{format(new Date(enq.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="col-span-4">
                      <p className="text-[13px] text-[#4B5563] truncate">{enq.service}</p>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        enq.status === 'new' ? 'bg-blue-50 text-blue-700' :
                        enq.status === 'booked' ? 'bg-green-50 text-green-700' :
                        enq.status === 'replied' ? 'bg-purple-50 text-purple-700' :
                        enq.status === 'archived' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {enq.status.charAt(0).toUpperCase() + enq.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enquiries by Service */}
        <div className="border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white">
          <div className="p-6 border-b border-[#EBEBEB]">
            <h2 className="text-[15px] font-medium text-[#111827]">By Service</h2>
          </div>
          <div className="p-6">
            {!stats.enquiriesByService?.length ? (
              <p className="text-[#6B7280] text-[13px]">No data available.</p>
            ) : (
              <div className="space-y-4">
                {stats.enquiriesByService.map((item) => (
                  <div key={item.service} className="flex justify-between items-center">
                    <span className="text-[13px] text-[#4B5563] truncate pr-4">{item.service}</span>
                    <span className="text-[13px] font-medium text-[#111827] bg-gray-50 px-2 py-0.5 rounded-md">{item.count}</span>
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