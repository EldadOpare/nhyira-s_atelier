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
    new: "bg-[#0D6E6E]/10 text-[#0D6E6E]",
    read: "bg-gray-100 text-gray-600",
    replied: "bg-blue-100 text-blue-700",
    booked: "bg-green-100 text-green-700",
    archived: "bg-gray-50 text-gray-400"
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-4xl text-[#0A4F4F]">Enquiries</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", ...statuses].map(status => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 font-label text-xs tracking-widest rounded-full transition-colors whitespace-nowrap ${
              activeTab === status 
                ? "bg-[#0D6E6E] text-white" 
                : "bg-white border border-[#0D6E6E]/20 text-[#0A4F4F] hover:bg-[#F9F5EE]"
            }`}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#0D6E6E]/20 rounded-[1rem] overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#F9F5EE] rounded animate-pulse" />)}
          </div>
        ) : !filteredEnquiries.length ? (
          <div className="p-12 text-center text-gray-500 font-sans">
            No enquiries found.
          </div>
        ) : (
          <div className="divide-y divide-[#0D6E6E]/10">
            <div className="grid grid-cols-12 gap-4 p-4 px-6 bg-[#F9F5EE]/50 border-b border-[#0D6E6E]/10 font-label text-[10px] tracking-widest text-[#0A4F4F]">
              <div className="col-span-3">NAME</div>
              <div className="col-span-3">SERVICE</div>
              <div className="col-span-2">DATE</div>
              <div className="col-span-2">EVENT DATE</div>
              <div className="col-span-2 text-right">STATUS</div>
            </div>
            {filteredEnquiries.map((enq) => (
              <div 
                key={enq.id} 
                onClick={() => handleOpenPanel(enq)}
                className="grid grid-cols-12 gap-4 p-4 px-6 items-center hover:bg-[#F9F5EE] transition-colors cursor-pointer"
              >
                <div className="col-span-3 font-sans font-medium text-[#0A4F4F] truncate">{enq.name}</div>
                <div className="col-span-3 font-sans text-sm text-gray-600 truncate">{enq.service}</div>
                <div className="col-span-2 font-sans text-sm text-gray-500">{format(new Date(enq.createdAt), "MMM d, yyyy")}</div>
                <div className="col-span-2 font-sans text-sm text-gray-500">{enq.eventDate ? format(new Date(enq.eventDate), "MMM d, yyyy") : '-'}</div>
                <div className="col-span-2 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-label tracking-widest ${statusColors[enq.status]}`}>
                    {enq.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        <SheetContent className="sm:max-w-md bg-[#F9F5EE] border-l-[#0D6E6E]/20 p-0 flex flex-col h-full">
          {selectedEnquiry && (
            <>
              <SheetHeader className="p-6 border-b border-[#0D6E6E]/10 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-label tracking-widest ${statusColors[selectedEnquiry.status]}`}>
                    {selectedEnquiry.status.toUpperCase()}
                  </span>
                  <span className="font-sans text-xs text-gray-400">
                    {format(new Date(selectedEnquiry.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <SheetTitle className="font-heading text-3xl text-[#0A4F4F]">{selectedEnquiry.name}</SheetTitle>
                <SheetDescription className="font-sans text-sm text-[#0D6E6E]">
                  Interested in: <strong className="font-medium">{selectedEnquiry.service}</strong>
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-1">EMAIL</p>
                    <p className="font-sans text-sm">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-1">PHONE</p>
                    <p className="font-sans text-sm">{selectedEnquiry.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-1">EVENT DATE</p>
                    <p className="font-sans text-sm">{selectedEnquiry.eventDate ? format(new Date(selectedEnquiry.eventDate), "MMMM d, yyyy") : '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-2">MESSAGE</p>
                  <div className="bg-white p-4 border border-[#0D6E6E]/10 rounded-none font-sans text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message}
                  </div>
                </div>

                <div className="pt-6 border-t border-[#0D6E6E]/10">
                  <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-2">UPDATE STATUS</p>
                  <Select value={selectedEnquiry.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-white rounded-none border-[#0D6E6E]/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => (
                        <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="font-label text-[10px] tracking-widest text-[#0A4F4F] mb-2">INTERNAL NOTES</p>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes here..."
                    className="bg-white rounded-none border-[#0D6E6E]/30 min-h-[120px] mb-3"
                  />
                  <Button onClick={handleSaveNotes} disabled={updateEnquiry.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-none font-label tracking-widest text-xs h-10">
                    SAVE NOTES
                  </Button>
                </div>
              </div>

              <div className="p-4 border-t border-[#0D6E6E]/10 bg-white">
                <Button variant="ghost" onClick={handleDelete} className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-none">
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