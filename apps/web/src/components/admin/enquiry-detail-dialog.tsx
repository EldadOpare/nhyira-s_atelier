import { useState, useEffect } from "react";
import { useUpdateEnquiry, useDeleteEnquiry, getListEnquiriesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Trash2 } from "lucide-react";

const statuses = ["new", "read", "replied", "booked", "archived"];

const statusStyles: Record<string, string> = {
  new:      "bg-blue-50 text-blue-600",
  read:     "bg-[#F5F5F5] text-[#6B7280]",
  replied:  "bg-purple-50 text-purple-600",
  booked:   "bg-emerald-50 text-emerald-600",
  archived: "bg-[#F5F5F5] text-[#A8A29E]",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${statusStyles[status] ?? "bg-[#F5F5F5] text-[#9CA3AF]"}`}>
      {status}
    </span>
  );
}

export function EnquiryDetailDialog({
  enquiry,
  onClose,
}: {
  enquiry: any | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const updateEnquiry = useUpdateEnquiry();
  const deleteEnquiry = useDeleteEnquiry();
  const [notes, setNotes] = useState("");
  const [current, setCurrent] = useState<any>(null);

  // Kept our own copy so the status and notes updated right away on screen.
  useEffect(() => {
    setCurrent(enquiry);
    setNotes(enquiry?.notes ?? "");
  }, [enquiry]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListEnquiriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
  };

  if (!current) return null;

  const handleStatusChange = (status: string) => {
    updateEnquiry.mutate({ id: current.id, data: { status: status as any } }, {
      onSuccess: (updated) => { setCurrent(updated); invalidate(); },
    });
  };

  const handleSaveNotes = () => {
    updateEnquiry.mutate({ id: current.id, data: { notes } }, {
      onSuccess: (updated) => { setCurrent(updated); invalidate(); },
    });
  };

  const handleDelete = () => {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    deleteEnquiry.mutate({ id: current.id }, {
      onSuccess: () => { invalidate(); onClose(); },
    });
  };

  const firstName = (current.name ?? "").split(" ")[0] || "there";
  const replyHref =
    `mailto:${encodeURIComponent(`${current.name} <${current.email}>`)}` +
    `?subject=${encodeURIComponent(`Re: Your enquiry — ${current.service}`)}` +
    `&body=${encodeURIComponent(`Hi ${firstName},\n\nThank you for reaching out to Nhyira's Atelier.\n\n`)}`;

  const notesChanged = (notes ?? "") !== (current.notes ?? "");

  return (
    <Dialog open={!!enquiry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[600px] max-h-[88vh] p-0 gap-0 bg-white border border-[#E7E5E4] rounded-[16px] sm:rounded-[16px] overflow-hidden flex flex-col shadow-[0_24px_60px_-15px_rgba(28,25,23,0.25)] font-sans">
        {/* Header */}
        <DialogHeader className="px-7 py-6 border-b border-[#F1F0EE] shrink-0 text-left space-y-0">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[10px] bg-[#0D6E6E]/[0.09] flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare size={18} className="text-[#0D6E6E]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <DialogTitle className="text-[18px] font-medium text-[#1C1917] leading-none">{current.name}</DialogTitle>
                <StatusBadge status={current.status} />
              </div>
              <p className="text-[13px] text-[#57534E] leading-snug">
                Interested in <span className="font-medium text-[#1C1917]">{current.service}</span>
              </p>
              <p className="text-[12px] text-[#A8A29E] mt-1">
                {format(new Date(current.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          {/* Contact info */}
          <div className="grid grid-cols-2 gap-4 bg-[#FBFAF9] p-4 rounded-[10px] border border-[#F1F0EE]">
            <div>
              <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider mb-1">Email</p>
              <a href={`mailto:${current.email}`} className="text-[13px] text-[#0D6E6E] hover:underline break-all">{current.email}</a>
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider mb-1">Phone</p>
              <p className="text-[13px] text-[#111827]">{current.phone || "—"}</p>
            </div>
            <div className="col-span-2 pt-3 border-t border-[#F1F0EE]">
              <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider mb-1">Event Date</p>
              <p className="text-[13px] text-[#111827]">{current.eventDate ? format(new Date(current.eventDate), "MMMM d, yyyy") : "—"}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider mb-2">Message</p>
            <div className="bg-white border border-[#E7E5E4] rounded-[10px] p-4 text-[13px] text-[#4B5563] whitespace-pre-wrap leading-relaxed">
              {current.message}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider mb-2">Status</p>
            <Select value={current.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-white rounded-[8px] border-[#E7E5E4] h-10 focus:ring-[#0D6E6E] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-[8px] border-[#E7E5E4]">
                {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Internal notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Internal Notes</p>
              <span className="text-[10.5px] text-[#A8A29E]">Private — only you can see this</span>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down anything about this enquiry…"
              className="bg-white rounded-[8px] border-[#E7E5E4] min-h-[90px] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] text-[13px] resize-none"
            />
            {notesChanged && (
              <Button onClick={handleSaveNotes} disabled={updateEnquiry.isPending}
                className="mt-2 bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-[8px] font-medium text-[12px] h-8 px-3">
                {updateEnquiry.isPending ? "Saving…" : "Save notes"}
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#F1F0EE] flex items-center justify-between gap-3 shrink-0 bg-[#FBFAF9]">
          <Button type="button" variant="outline" onClick={handleDelete} disabled={deleteEnquiry.isPending}
            className="text-[13px] font-medium text-[#B91C1C] border-[#F0CDCD] hover:bg-red-50 hover:text-[#B91C1C] rounded-[8px] h-10 px-4">
            <Trash2 size={14} className="mr-1.5" /> {deleteEnquiry.isPending ? "Deleting…" : "Delete"}
          </Button>
          <a href={replyHref}>
            <Button type="button" className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-[8px] font-medium text-[13px] h-10 px-5">
              <Mail size={14} className="mr-1.5" /> Reply by email
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
