import { useState } from "react";
import { useListEnquiries, useUpdateEnquiry, useDeleteEnquiry, getListEnquiriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const statuses = ["new", "read", "replied", "booked", "archived"];

const statusStyles: Record<string, string> = {
  new:      "bg-blue-50 text-blue-600",
  read:     "bg-[#F5F5F5] text-[#6B7280]",
  replied:  "bg-purple-50 text-purple-600",
  booked:   "bg-emerald-50 text-emerald-600",
  archived: "bg-[#F5F5F5] text-[#B0B0B0]",
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
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();
  const { data: enquiries, isLoading } = useListEnquiries();
  const updateEnquiry = useUpdateEnquiry();
  const deleteEnquiry = useDeleteEnquiry();

  const filteredEnquiries = enquiries?.filter(e => activeTab === "all" || e.status === activeTab) || [];

  const handleOpenPanel = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setNotes(enquiry.notes || "");
  };

  const handleStatusChange = (status: any) => {
    if (!selectedEnquiry) return;
    updateEnquiry.mutate({ id: selectedEnquiry.id, data: { status } }, {
      onSuccess: (updated) => { setSelectedEnquiry(updated); queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() }); }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedEnquiry) return;
    updateEnquiry.mutate({ id: selectedEnquiry.id, data: { notes } }, {
      onSuccess: (updated) => { setSelectedEnquiry(updated); queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() }); }
    });
  };

  const handleDelete = () => {
    if (!selectedEnquiry || !confirm("Delete this enquiry?")) return;
    deleteEnquiry.mutate({ id: selectedEnquiry.id }, {
      onSuccess: () => { setSelectedEnquiry(null); queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() }); }
    });
  };

  const allTabs = ["all", ...statuses];

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-medium text-[#111827] tracking-tight">Enquiries</h1>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5">Review and manage client requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {allTabs.map(status => (
          <button key={status} onClick={() => setActiveTab(status)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors capitalize ${
              activeTab === status ? "bg-[#111827] text-white" : "text-[#9CA3AF] hover:bg-white hover:text-[#4B5563]"
            }`}>
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-[#F8F8F8] rounded-lg animate-pulse" />)}
          </div>
        ) : !filteredEnquiries.length ? (
          <div className="p-14 text-center text-[#B0B0B0] text-[13px]">No enquiries found.</div>
        ) : (
          <div className="divide-y divide-[#F2F2F2]">
            {/* Column headers */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-medium text-[#C4C4C4] uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Received</div>
              <div className="col-span-2">Event Date</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {filteredEnquiries.map((enq) => (
              <div key={enq.id} onClick={() => handleOpenPanel(enq)}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#FAFAFA] transition-colors cursor-pointer">
                <div className="col-span-3 text-[13px] font-medium text-[#111827] truncate">{enq.name}</div>
                <div className="col-span-3 text-[13px] text-[#6B7280] truncate">{enq.service}</div>
                <div className="col-span-2 text-[12px] text-[#B0B0B0]">{format(new Date(enq.createdAt), "MMM d, yyyy")}</div>
                <div className="col-span-2 text-[12px] text-[#B0B0B0]">{enq.eventDate ? format(new Date(enq.eventDate), "MMM d, yyyy") : "—"}</div>
                <div className="col-span-2 text-right"><StatusBadge status={enq.status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      <Sheet open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <SheetContent className="sm:max-w-[420px] bg-white border-l border-[#EBEBEB] p-0 flex flex-col font-sans">
          {selectedEnquiry && (
            <>
              <SheetHeader className="px-6 pt-6 pb-5 border-b border-[#EBEBEB]">
                <div className="flex justify-between items-center mb-3">
                  <StatusBadge status={selectedEnquiry.status} />
                  <span className="text-[11px] text-[#C4C4C4]">{format(new Date(selectedEnquiry.createdAt), "MMM d, yyyy · h:mm a")}</span>
                </div>
                <SheetTitle className="text-[18px] font-medium text-[#111827] leading-tight">{selectedEnquiry.name}</SheetTitle>
                <SheetDescription className="text-[13px] text-[#9CA3AF] mt-0.5">
                  Interested in: <span className="font-medium text-[#4B5563]">{selectedEnquiry.service}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
                {/* Contact info */}
                <div className="grid grid-cols-2 gap-4 bg-[#F8F8F8] p-4 rounded-xl border border-[#F2F2F2]">
                  <div>
                    <p className="text-[10px] font-medium text-[#C4C4C4] uppercase tracking-wider mb-1">Email</p>
                    <p className="text-[13px] text-[#111827] break-all">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[#C4C4C4] uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-[13px] text-[#111827]">{selectedEnquiry.phone || "—"}</p>
                  </div>
                  <div className="col-span-2 pt-3 border-t border-[#EBEBEB]">
                    <p className="text-[10px] font-medium text-[#C4C4C4] uppercase tracking-wider mb-1">Event Date</p>
                    <p className="text-[13px] text-[#111827]">{selectedEnquiry.eventDate ? format(new Date(selectedEnquiry.eventDate), "MMMM d, yyyy") : "—"}</p>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-2">Message</p>
                  <div className="bg-white border border-[#EBEBEB] rounded-xl p-4 text-[13px] text-[#4B5563] whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message}
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-2">Update Status</p>
                  <Select value={selectedEnquiry.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-white rounded-lg border-[#EBEBEB] h-9 focus:ring-[#0D6E6E]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg border-[#EBEBEB]">
                      {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-2">Internal Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes…"
                    className="bg-white rounded-lg border-[#EBEBEB] min-h-[100px] mb-2.5 focus-visible:ring-[#0D6E6E] text-[13px]"
                  />
                  <Button onClick={handleSaveNotes} disabled={updateEnquiry.isPending}
                    className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg font-medium text-[13px] h-9">
                    Save Notes
                  </Button>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#EBEBEB]">
                <Button variant="ghost" onClick={handleDelete}
                  className="w-full text-[#C4C4C4] hover:text-red-500 hover:bg-red-50 rounded-lg h-9 text-[13px]">
                  <Trash2 size={14} className="mr-2" /> Delete Enquiry
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
