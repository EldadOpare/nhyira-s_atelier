import { useGetStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <h1 className="font-heading text-4xl text-[#0A4F4F]">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-[#F9F5EE] rounded-[1rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <h1 className="font-heading text-4xl text-[#0A4F4F]">Overview</h1>
        <p className="font-sans text-sm text-gray-500">Welcome back, Nhyira</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#F9F5EE] p-6 border border-[#0D6E6E]/20 rounded-[1rem] flex flex-col justify-between h-32">
          <p className="font-label text-xs tracking-widest text-[#0D6E6E]">TOTAL ENQUIRIES</p>
          <p className="font-heading text-4xl text-[#0A4F4F]">{stats.totalEnquiries}</p>
        </div>
        <div className="bg-[#F9F5EE] p-6 border border-[#0D6E6E]/20 rounded-[1rem] flex flex-col justify-between h-32">
          <p className="font-label text-xs tracking-widest text-[#0D6E6E]">NEW ENQUIRIES</p>
          <p className="font-heading text-4xl text-[#0A4F4F]">{stats.newEnquiries}</p>
        </div>
        <div className="bg-[#F9F5EE] p-6 border border-[#0D6E6E]/20 rounded-[1rem] flex flex-col justify-between h-32">
          <p className="font-label text-xs tracking-widest text-[#0D6E6E]">BOOKED</p>
          <p className="font-heading text-4xl text-[#0A4F4F]">{stats.bookedEnquiries}</p>
        </div>
        <div className="bg-[#F9F5EE] p-6 border border-[#0D6E6E]/20 rounded-[1rem] flex flex-col justify-between h-32">
          <p className="font-label text-xs tracking-widest text-[#0D6E6E]">PORTFOLIO ITEMS</p>
          <p className="font-heading text-4xl text-[#0A4F4F]">{stats.totalPortfolioItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2 border border-[#0D6E6E]/20 rounded-[1rem] overflow-hidden bg-white">
          <div className="p-6 border-b border-[#0D6E6E]/10 bg-[#F9F5EE]/50">
            <h2 className="font-heading text-2xl text-[#0A4F4F]">Recent Enquiries</h2>
          </div>
          <div className="p-0">
            {!stats.recentEnquiries?.length ? (
              <p className="p-6 text-gray-500 font-sans text-sm">No recent enquiries.</p>
            ) : (
              <div className="divide-y divide-[#0D6E6E]/10">
                {stats.recentEnquiries.map((enq) => (
                  <div key={enq.id} className="p-4 px-6 flex justify-between items-center hover:bg-[#F9F5EE]/30 transition-colors">
                    <div>
                      <p className="font-sans font-medium text-[#0A4F4F]">{enq.name}</p>
                      <p className="font-sans text-sm text-gray-500">{enq.service}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-label tracking-widest ${
                        enq.status === 'new' ? 'bg-[#0D6E6E]/10 text-[#0D6E6E]' :
                        enq.status === 'booked' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {enq.status.toUpperCase()}
                      </span>
                      <p className="font-sans text-xs text-gray-400 mt-1">{format(new Date(enq.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enquiries by Service */}
        <div className="border border-[#0D6E6E]/20 rounded-[1rem] overflow-hidden bg-white">
          <div className="p-6 border-b border-[#0D6E6E]/10 bg-[#F9F5EE]/50">
            <h2 className="font-heading text-2xl text-[#0A4F4F]">By Service</h2>
          </div>
          <div className="p-6">
            {!stats.enquiriesByService?.length ? (
              <p className="text-gray-500 font-sans text-sm">No data available.</p>
            ) : (
              <div className="space-y-4">
                {stats.enquiriesByService.map((item) => (
                  <div key={item.service} className="flex justify-between items-center">
                    <span className="font-sans text-sm text-[#0A4F4F]">{item.service}</span>
                    <span className="font-sans font-medium text-[#0D6E6E]">{item.count}</span>
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