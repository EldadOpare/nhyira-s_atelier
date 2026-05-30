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
      onSuccess: (updated) => {
        setSelectedEnquiry(updated);
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedEnquiry) return;
    updateEnquiry.mutate({ id: selectedEnquiry.id, data: { notes } }, {
      onSuccess: (updated) => {
        setSelectedEnquiry(updated);
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
      }
    });
  };

  const handleDelete = () => {
    if (!selectedEnquiry || !confirm("Are you sure you want to delete this enquiry?")) return;
    deleteEnquiry.mutate({ id: selectedEnquiry.id }, {
      onSuccess: () => {
        setSelectedEnquiry(null);
        queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
      }
    });
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700",
    read: "bg-gray-100 text-gray-700",
    replied: "bg-purple-50 text-purple-700",
    booked: "bg-green-50 text-green-700",
    archived: "bg-gray-50 text-gray-500"
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-[#111827]">Enquiries</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EBEBEB] pb-4 overflow-x-auto">
        {["all", ...statuses].map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap capitalize ${
              activeTab === status 
                ? "bg-[#111827] text-white" 
                : "text-[#6B7280] hover:bg-gray-100"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
          </div>
        ) : !filteredEnquiries.length ? (
          <div className="p-12 text-center text-[#6B7280] text-[14px]">
            No enquiries found.
          </div>
        ) : (
          <div className="divide-y divide-[#EBEBEB]">
            <div className="grid grid-cols-12 gap-4 p-4 px-6 bg-gray-50 text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Service</div>
              <div className="col-span-2">Date Received</div>
              <div className="col-span-2">Event Date</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {filteredEnquiries.map((enq) => (
              <div 
                key={enq.id} 
                onClick={() => handleOpenPanel(enq)}
                className="grid grid-cols-12 gap-4 p-4 px-6 items-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="col-span-3 text-[13px] font-medium text-[#111827] truncate">{enq.name}</div>
                <div className="col-span-3 text-[13px] text-[#4B5563] truncate">{enq.service}</div>
                <div className="col-span-2 text-[12px] text-[#6B7280]">{format(new Date(enq.createdAt), "MMM d, yyyy")}</div>
                <div className="col-span-2 text-[12px] text-[#6B7280]">{enq.eventDate ? format(new Date(enq.eventDate), "MMM d, yyyy") : '-'}</div>
                <div className="col-span-2 text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${statusColors[enq.status]}`}>
                    {enq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <SheetContent className="sm:max-w-md bg-white border-l-[#EBEBEB] p-0 flex flex-col h-full font-sans">
          {selectedEnquiry && (
            <>
              <SheetHeader className="p-6 border-b border-[#EBEBEB] bg-white">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${statusColors[selectedEnquiry.status]}`}>
                    {selectedEnquiry.status}
                  </span>
                  <span className="text-[12px] text-[#9CA3AF]">
                    {format(new Date(selectedEnquiry.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <SheetTitle className="text-xl font-semibold text-[#111827]">{selectedEnquiry.name}</SheetTitle>
                <SheetDescription className="text-[13px] text-[#4B5563] mt-1">
                  Interested in: <strong className="font-medium text-[#111827]">{selectedEnquiry.service}</strong>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-[#EBEBEB]">
                  <div>
                    <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Email</p>
                    <p className="text-[13px] text-[#111827] break-all">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-[13px] text-[#111827]">{selectedEnquiry.phone || '-'}</p>
                  </div>
                  <div className="col-span-2 pt-4 border-t border-[#EBEBEB]">
                    <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Event Date</p>
                    <p className="text-[13px] text-[#111827]">{selectedEnquiry.eventDate ? format(new Date(selectedEnquiry.eventDate), "MMMM d, yyyy") : '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] font-medium text-[#111827] mb-2">Message</p>
                  <div className="bg-white p-4 border border-[#EBEBEB] rounded-xl text-[14px] text-[#4B5563] whitespace-pre-wrap leading-relaxed shadow-sm">
                    {selectedEnquiry.message}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#EBEBEB]">
                  <p className="text-[12px] font-medium text-[#111827] mb-3">Update Status</p>
                  <Select value={selectedEnquiry.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-white rounded-lg border-[#EBEBEB] h-10 shadow-sm focus:ring-[#0D6E6E]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg border-[#EBEBEB]">
                      {statuses.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-[12px] font-medium text-[#111827] mb-3">Internal Notes</p>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes here..."
                    className="bg-white rounded-lg border-[#EBEBEB] min-h-[120px] mb-3 shadow-sm focus-visible:ring-[#0D6E6E]"
                  />
                  <Button onClick={handleSaveNotes} disabled={updateEnquiry.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg font-medium text-[13px] h-10">
                    Save Notes
                  </Button>
                </div>
              </div>

              <div className="p-4 border-t border-[#EBEBEB] bg-gray-50 mt-auto">
                <Button variant="ghost" onClick={handleDelete} className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg h-10">
                  <Trash2 size={16} className="mr-2" /> Delete Enquiry
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}