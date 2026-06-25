import { useState, useEffect } from "react";
import { useListEnquiries } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useAdminPage } from "@/lib/admin-page-context";
import { EnquiryDetailDialog } from "@/components/admin/enquiry-detail-dialog";

const statuses = ["new", "read", "replied", "booked", "archived"];

const statusStyles: Record<string, string> = {
  new:      "bg-blue-50 text-blue-600",
  read:     "bg-[#F5F5F5] text-[#6B7280]",
  replied:  "bg-purple-50 text-purple-600",
  booked:   "bg-emerald-50 text-emerald-600",
  archived: "bg-[#F5F5F5] text-[#AFAFAF]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${statusStyles[status] ?? "bg-[#F5F5F5] text-[#9CA3AF]"}`}>
      {status}
    </span>
  );
}

export default function AdminEnquiries() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

  const { data: enquiries, isLoading } = useListEnquiries();
  const { setHeader } = useAdminPage();

  useEffect(() => {
    setHeader({ title: "Enquiries", subtitle: "Review and manage client requests" });
  }, [setHeader]);

  const filteredEnquiries = enquiries?.filter(e => activeTab === "all" || e.status === activeTab) || [];

  const handleOpenPanel = (enquiry: any) => setSelectedEnquiry(enquiry);

  return (
    <div className="space-y-6 font-sans">
      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", ...statuses].map(status => (
          <button key={status} onClick={() => setActiveTab(status)}
            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors capitalize ${
              activeTab === status ? "bg-[#0D6E6E] text-white" : "text-[#AFAFAF] hover:bg-white hover:text-[#4B5563]"
            }`}>
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="animate-admin-fade-up admin-card bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-[#FAFAF9] rounded-[8px] animate-pulse" />)}
          </div>
        ) : !filteredEnquiries.length ? (
          <div className="p-14 text-center text-[#BEBEBE] text-[13px]">No enquiries found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block divide-y divide-[#F1F0EE]">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider">
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Service</div>
                <div className="col-span-2">Received</div>
                <div className="col-span-2">Event Date</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              {filteredEnquiries.map((enq) => (
                <div key={enq.id} onClick={() => handleOpenPanel(enq)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#FAFAF9] transition-colors cursor-pointer">
                  <div className="col-span-3 text-[13px] font-medium text-[#111827] truncate">{enq.name}</div>
                  <div className="col-span-3 text-[13px] text-[#6B7280] truncate">{enq.service}</div>
                  <div className="col-span-2 text-[12px] text-[#BEBEBE]">{format(new Date(enq.createdAt), "MMM d, yyyy")}</div>
                  <div className="col-span-2 text-[12px] text-[#BEBEBE]">{enq.eventDate ? format(new Date(enq.eventDate), "MMM d, yyyy") : "—"}</div>
                  <div className="col-span-2 text-right"><StatusBadge status={enq.status} /></div>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#F1F0EE]">
              {filteredEnquiries.map((enq) => (
                <div key={enq.id} onClick={() => handleOpenPanel(enq)}
                  className="px-5 py-4 flex items-start justify-between gap-3 hover:bg-[#FAFAF9] transition-colors cursor-pointer active:bg-[#F1F0EE]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#111827] truncate">{enq.name}</p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">{enq.service}</p>
                    <p className="text-[11px] text-[#BEBEBE] mt-1">
                      {format(new Date(enq.createdAt), "MMM d, yyyy")}
                      {enq.eventDate && <span className="ml-2">· Event: {format(new Date(enq.eventDate), "MMM d")}</span>}
                    </p>
                  </div>
                  <StatusBadge status={enq.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Centered detail modal */}
      <EnquiryDetailDialog enquiry={selectedEnquiry} onClose={() => setSelectedEnquiry(null)} />
    </div>
  );
}
