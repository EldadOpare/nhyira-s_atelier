import { useState, useEffect } from "react";
import { useListPortfolio, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, getListPortfolioQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { uploadPortfolioImage } from "@/lib/upload";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAdminPage } from "@/lib/admin-page-context";

const portfolioSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  packageDetails: z.string().optional(),
  estimatedBudget: z.string().optional(),
  images: z.array(z.object({ url: z.string().url("Must be a valid URL") })).min(1, "At least one image is required"),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

export default function AdminPortfolio() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");

  const queryClient = useQueryClient();
  const { data: items, isLoading } = useListPortfolio();
  const createItem = useCreatePortfolioItem();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const { setHeader } = useAdminPage();

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { title: "", category: "", description: "", packageDetails: "", estimatedBudget: "", images: [{ url: "" }], tags: "", published: false }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "images" });
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(u => ({ ...u, [index]: true }));
    try {
      const url = await uploadPortfolioImage(file);
      form.setValue(`images.${index}.url`, url, { shouldValidate: true });
    } catch (err: any) {
      alert(`Upload failed: ${err?.message ?? err}`);
    } finally {
      setUploading(u => ({ ...u, [index]: false }));
    }
  };

  useEffect(() => {
    setHeader({
      title: "Portfolio",
      subtitle: "Manage your published works",
      action: (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg text-[13px] font-medium h-9 px-4 gap-1.5">
              <Plus size={14} /> Add Work
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[680px] max-h-[90vh] overflow-y-auto bg-white border border-[#EBEBEB] rounded-2xl p-0">
            <DialogHeader className="px-8 pt-7 pb-5 border-b border-[#EBEBEB]">
              <DialogTitle className="text-[18px] font-medium text-[#111827]">
                {editingId ? "Edit Portfolio Item" : "New Portfolio Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="px-8 py-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Title</FormLabel>
                        <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] h-9" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Category</FormLabel>
                        <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] h-9" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Description</FormLabel>
                      <FormControl><Textarea {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] min-h-[80px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField control={form.control} name="packageDetails" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Package Details</FormLabel>
                        <FormControl><Textarea {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] min-h-[70px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Estimated Budget</FormLabel>
                        <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] h-9" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider mb-2.5">Images</p>
                    <div className="space-y-3">
                      {fields.map((field, index) => {
                        const url = form.watch(`images.${index}.url`);
                        return (
                          <div key={field.id} className="flex gap-3 items-start">
                            {/* Thumbnail / placeholder */}
                            <div className="relative w-[72px] h-[72px] shrink-0 rounded-lg border border-[#EBEBEB] bg-[#FAFAFA] overflow-hidden flex items-center justify-center">
                              {url ? (
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={18} className="text-[#D4D4D4]" />
                              )}
                              {uploading[index] && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                  <span className="text-[9px] font-medium text-[#0D6E6E]">Uploading…</span>
                                </div>
                              )}
                            </div>

                            {/* URL field + actions */}
                            <div className="flex-1 space-y-2">
                              <FormField control={form.control} name={`images.${index}.url`} render={({ field }) => (
                                <FormItem>
                                  <FormControl><Input {...field} placeholder="Upload a file or paste an image URL" className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] h-9" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <div className="flex gap-2">
                                <label className={`inline-flex items-center gap-1.5 rounded-lg border border-[#EBEBEB] text-[12px] font-medium h-8 px-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors ${uploading[index] ? "opacity-50 pointer-events-none" : ""}`}>
                                  <Upload size={12} /> Upload
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(index, e)} />
                                </label>
                                <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} className="rounded-lg border-[#EBEBEB] text-red-400 hover:bg-red-50 h-8 px-3 text-[12px]">
                                  <Trash2 size={13} className="mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })} className="rounded-lg border-[#EBEBEB] text-[12px] font-medium h-8">
                        + Add Image
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
                    <FormField control={form.control} name="tags" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#AFAFAF] uppercase tracking-wider">Tags (comma separated)</FormLabel>
                        <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] h-9" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="published" render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 h-9 border border-[#EBEBEB] bg-white px-4 rounded-lg">
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <FormLabel className="text-[13px] font-medium text-[#111827] !mt-0">Published</FormLabel>
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" disabled={createItem.isPending || updateItem.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg font-medium text-[13px] h-10 mt-2">
                    {createItem.isPending || updateItem.isPending ? "Saving…" : "Save Portfolio Item"}
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      ),
    });
  }, [setHeader, isModalOpen, editingId]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        title: item.title, category: item.category, description: item.description || "",
        packageDetails: item.packageDetails || "", estimatedBudget: item.estimatedBudget || "",
        images: item.images.map((url: string) => ({ url })),
        tags: item.tags?.join(", ") || "", published: item.published,
      });
    } else {
      setEditingId(null);
      form.reset({ title: "", category: "", description: "", packageDetails: "", estimatedBudget: "", images: [{ url: "" }], tags: "", published: false });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: z.infer<typeof portfolioSchema>) => {
    const payload = { ...values, images: values.images.map(img => img.url), tags: values.tags ? values.tags.split(",").map(t => t.trim()) : [] };
    if (editingId) {
      updateItem.mutate({ id: editingId, data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() }); setIsModalOpen(false); } });
    } else {
      createItem.mutate({ data: payload }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() }); setIsModalOpen(false); } });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this item?")) {
      deleteItem.mutate({ id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() }) });
    }
  };

  const filteredItems = items?.filter(item => {
    if (activeTab === "published") return item.published;
    if (activeTab === "draft") return !item.published;
    return true;
  });

  const tabs = [{ id: "all", label: "All" }, { id: "published", label: "Published" }, { id: "draft", label: "Drafts" }];

  return (
    <div className="space-y-6 font-sans">
      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
              activeTab === tab.id ? "bg-[#111827] text-white" : "text-[#AFAFAF] hover:bg-white hover:text-[#4B5563]"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-[300px] bg-white border border-[#EBEBEB] rounded-xl animate-pulse" />)}
        </div>
      ) : !filteredItems?.length ? (
        <div className="text-center py-20 bg-white border border-[#EBEBEB] rounded-xl">
          <p className="text-[#BEBEBE] text-[13px]">No portfolio items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden flex flex-col group hover:border-[#D8D8D8] transition-colors">
              <div className="h-44 bg-[#F5F5F5] relative overflow-hidden">
                <img src={item.images[0] || "https://placehold.co/600x400/F5F5F5/C4C4C4"} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-medium rounded-full ${item.published ? "bg-white/90 text-emerald-600" : "bg-white/90 text-[#9CA3AF]"}`}>
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] font-medium text-[#BEBEBE] uppercase tracking-wider mb-1">{item.category}</p>
                <h3 className="text-[15px] font-medium text-[#111827] leading-snug">{item.title}</h3>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#F5F5F5]">
                  <span className="text-[11px] text-[#CECECE]">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-[#F5F5F5] text-[#BEBEBE] hover:text-[#4B5563]" onClick={() => handleOpenModal(item)}>
                      <Edit2 size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-red-50 text-[#CECECE] hover:text-red-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
