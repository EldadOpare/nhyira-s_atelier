import { useState, useEffect } from "react";
import { useListPortfolio, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, getListPortfolioQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, UploadCloud, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { uploadPortfolioImage } from "@/lib/upload";
import { ImageCrossfade } from "@/components/admin/image-crossfade";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useAdminPage } from "@/lib/admin-page-context";
import { useCategories } from "@/lib/categories";

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
  const { data: categories } = useCategories();
  const createItem = useCreatePortfolioItem();
  const updateItem = useUpdatePortfolioItem();
  const deleteItem = useDeletePortfolioItem();
  const { setHeader } = useAdminPage();

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: { title: "", category: "", description: "", packageDetails: "", estimatedBudget: "", images: [], tags: "", published: false }
  });

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "images" });
  // Watched the array directly so each thumbnail showed the moment its upload finished.
  const watchedImages = useWatch({ control: form.control, name: "images" }) ?? [];
  const [addingImage, setAddingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith("image/"));
    if (!images.length) return;
    setAddingImage(true);
    try {
      for (const file of images) {
        const url = await uploadPortfolioImage(file);
        append({ url });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err?.message ?? err}`);
    } finally {
      setAddingImage(false);
    }
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    uploadFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files ?? []));
  };

  useEffect(() => {
    setHeader({
      title: "Portfolio",
      subtitle: "Manage your published works",
      action: (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-[8px] text-[13px] font-medium h-9 px-4 gap-1.5">
              <Plus size={14} /> Add Work
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[620px] max-h-[88vh] p-0 gap-0 bg-white border border-[#E7E5E4] rounded-[16px] sm:rounded-[16px] overflow-hidden flex flex-col shadow-[0_24px_60px_-15px_rgba(28,25,23,0.25)]">
            {/* Header */}
            <DialogHeader className="px-6 py-5 border-b border-[#F1F0EE] shrink-0 text-left space-y-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-[#0D6E6E]/[0.09] flex items-center justify-center shrink-0">
                  <ImageIcon size={17} className="text-[#0D6E6E]" />
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-[16px] font-medium text-[#1C1917] leading-none">
                    {editingId ? "Edit Portfolio Item" : "New Portfolio Item"}
                  </DialogTitle>
                  <p className="text-[12px] text-[#A8A29E]">
                    {editingId ? "Update the details of this work." : "Add a new piece to your portfolio."}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <Form {...form}>
                <form id="portfolio-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Title</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. Garden Party Setup" className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] h-10 text-[13px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white rounded-[8px] border-[#E7E5E4] focus:ring-[#0D6E6E] h-10 text-[13px]">
                              <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white rounded-[8px] border-[#E7E5E4]">
                            {(categories ?? []).map((c) => (
                              <SelectItem key={c.id} value={c.name} className="text-[13px]">{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Description</FormLabel>
                      <FormControl><Textarea {...field} placeholder="A short description of this work…" className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] min-h-[80px] text-[13px] resize-none" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Images */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Images</p>
                      {fields.length > 0 && (
                        <span className="text-[11px] text-[#A8A29E]">{fields.length} added</span>
                      )}
                    </div>

                    {/* Drag & drop upload zone */}
                    <label
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center gap-2.5 w-full rounded-[14px] border-2 border-dashed px-6 py-9 cursor-pointer transition-all duration-150 ${
                        dragOver
                          ? "border-[#0D6E6E] bg-[#0D6E6E]/[0.05] scale-[0.995]"
                          : "border-[#D6D3D1] hover:border-[#0D6E6E]/60 hover:bg-[#FAFAF9]"
                      } ${addingImage ? "opacity-70 pointer-events-none" : ""}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#0D6E6E]/[0.08] flex items-center justify-center">
                        <UploadCloud size={22} className="text-[#0D6E6E]" />
                      </div>
                      {addingImage ? (
                        <span className="text-[13px] font-medium text-[#0D6E6E]">Uploading…</span>
                      ) : (
                        <>
                          <p className="text-[13px] text-[#57534E]">
                            <span className="font-medium text-[#0D6E6E]">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-[11px] text-[#A8A29E]">PNG, JPG or WEBP, up to 20MB each</p>
                        </>
                      )}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleAddImage} />
                    </label>

                    {/* Uploaded images. The first one is the cover, and the order
                        here is the order they cross-fade in on the public site. */}
                    {fields.length > 0 && (
                      <>
                        <p className="text-[11px] text-[#A8A29E] mt-3 mb-2">
                          The first image is the cover. Use the arrows to reorder how they play.
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {fields.map((field, index) => {
                            const url = watchedImages[index]?.url;
                            return (
                              <div key={field.id} className="relative group aspect-square rounded-[8px] border border-[#E7E5E4] bg-[#F5F5F5] overflow-hidden">
                                {url ? (
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={18} className="text-[#D4D4D4]" />
                                  </div>
                                )}

                                {index === 0 && (
                                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-[4px] bg-[#0D6E6E] text-white text-[9px] font-medium tracking-wide">
                                    Cover
                                  </span>
                                )}

                                {/* Remove */}
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Remove image"
                                >
                                  <X size={12} />
                                </button>

                                {/* Reorder */}
                                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => move(index, index - 1)}
                                    className="w-6 h-6 rounded-[6px] bg-white/90 text-[#1C1917] flex items-center justify-center disabled:opacity-30 hover:bg-white"
                                    aria-label="Move left"
                                  >
                                    <ChevronLeft size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === fields.length - 1}
                                    onClick={() => move(index, index + 1)}
                                    className="w-6 h-6 rounded-[6px] bg-white/90 text-[#1C1917] flex items-center justify-center disabled:opacity-30 hover:bg-white"
                                    aria-label="Move right"
                                  >
                                    <ChevronRight size={13} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <FormField control={form.control} name="images" render={() => (
                      <FormItem><FormMessage className="mt-2" /></FormItem>
                    )} />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="packageDetails" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Package Details</FormLabel>
                        <FormControl><Textarea {...field} placeholder="What's included…" className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] min-h-[70px] text-[13px] resize-none" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Estimated Budget</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g. GHS 2,000" className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] h-10 text-[13px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider">Tags</FormLabel>
                      <FormControl><Input {...field} placeholder="balloons, floral, pastel" className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] h-10 text-[13px]" /></FormControl>
                      <p className="text-[11px] text-[#A8A29E] mt-1">Separate with commas.</p>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Publish toggle */}
                  <FormField control={form.control} name="published" render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4 rounded-[10px] border border-[#E7E5E4] bg-[#FBFAF9] px-4 py-3 space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[13px] font-medium text-[#1C1917] !mt-0">Publish to site</FormLabel>
                        <p className="text-[11.5px] text-[#A8A29E]">When on, this work appears on the public site.</p>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#0D6E6E]" /></FormControl>
                    </FormItem>
                  )} />
                </form>
              </Form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#F1F0EE] flex items-center justify-end gap-2.5 shrink-0 bg-[#FBFAF9]">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[13px] font-medium text-[#57534E] hover:bg-[#F1F0EE] rounded-[8px] h-10 px-4">
                Cancel
              </Button>
              <Button type="submit" form="portfolio-form" disabled={createItem.isPending || updateItem.isPending} className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-[8px] font-medium text-[13px] h-10 px-5">
                {createItem.isPending || updateItem.isPending ? "Saving…" : editingId ? "Save changes" : "Create item"}
              </Button>
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
      form.reset({ title: "", category: "", description: "", packageDetails: "", estimatedBudget: "", images: [], tags: "", published: false });
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
            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
              activeTab === tab.id ? "bg-[#0D6E6E] text-white" : "text-[#AFAFAF] hover:bg-white hover:text-[#4B5563]"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-[300px] bg-white border border-[#E7E5E4] rounded-[10px] animate-pulse" />)}
        </div>
      ) : !filteredItems?.length ? (
        <div className="text-center py-20 bg-white border border-[#E7E5E4] rounded-[10px] admin-card">
          <p className="text-[#BEBEBE] text-[13px]">No portfolio items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item: any, idx: number) => (
            <div key={item.id} className="animate-admin-fade-up admin-card admin-card-hover bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden flex flex-col group transition-shadow" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="h-44 bg-[#F5F5F5] relative overflow-hidden">
                <ImageCrossfade images={item.images ?? []} className="w-full h-full" />
                <span className={`absolute top-3 left-3 z-10 px-2 py-0.5 text-[10px] font-medium rounded-full ${item.published ? "bg-white/90 text-emerald-600" : "bg-white/90 text-[#9CA3AF]"}`}>
                  {item.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-[10px] font-medium text-[#A8A29E] uppercase tracking-wider mb-1">{item.category}</p>
                <h3 className="text-[15px] font-medium text-[#111827] leading-snug">{item.title}</h3>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-[#F1F0EE]">
                  <span className="text-[11px] text-[#CECECE]">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[8px] hover:bg-[#F5F5F5] text-[#BEBEBE] hover:text-[#4B5563]" onClick={() => handleOpenModal(item)}>
                      <Edit2 size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-[8px] hover:bg-red-50 text-[#CECECE] hover:text-red-500" onClick={() => handleDelete(item.id)}>
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
