import { useState } from "react";
import { useListPortfolio, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, getListPortfolioQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

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

  const form = useForm<z.infer<typeof portfolioSchema>>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      packageDetails: "",
      estimatedBudget: "",
      images: [{ url: "" }],
      tags: "",
      published: false,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images"
  });

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      form.reset({
        title: item.title,
        category: item.category,
        description: item.description || "",
        packageDetails: item.packageDetails || "",
        estimatedBudget: item.estimatedBudget || "",
        images: item.images.map((url: string) => ({ url })),
        tags: item.tags?.join(", ") || "",
        published: item.published,
      });
    } else {
      setEditingId(null);
      form.reset({
        title: "",
        category: "",
        description: "",
        packageDetails: "",
        estimatedBudget: "",
        images: [{ url: "" }],
        tags: "",
        published: false,
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: z.infer<typeof portfolioSchema>) => {
    const payload = {
      ...values,
      images: values.images.map(img => img.url),
      tags: values.tags ? values.tags.split(",").map(t => t.trim()) : [],
    };

    if (editingId) {
      updateItem.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() });
          setIsModalOpen(false);
        }
      });
    } else {
      createItem.mutate({ data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() });
          setIsModalOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey() })
      });
    }
  };

  const filteredItems = items?.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return item.published;
    if (activeTab === "draft") return !item.published;
    return true;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-[#111827]">Portfolio</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg text-[13px] font-medium h-9 px-4">
              <Plus className="mr-2" size={14} /> Add New Work
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border border-[#EBEBEB] p-8 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-medium text-[#111827] mb-6">
                {editingId ? "Edit Portfolio Item" : "New Portfolio Item"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#4B5563]">Title</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#4B5563]">Category</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px] font-medium text-[#4B5563]">Description</FormLabel>
                    <FormControl><Textarea {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E] min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="packageDetails" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#4B5563]">Package Details</FormLabel>
                      <FormControl><Textarea {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#4B5563]">Estimated Budget</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div>
                  <FormLabel className="text-[12px] font-medium text-[#4B5563] mb-3 block">Images (URLs)</FormLabel>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`images.${index}.url`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input {...field} placeholder="https://..." className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} className="rounded-lg border-[#EBEBEB] text-red-500 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })} className="rounded-lg border-[#EBEBEB] text-[12px] font-medium">
                      + Add Image
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px] font-medium text-[#4B5563]">Tags (Comma separated)</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-lg border-[#EBEBEB] focus-visible:ring-[#0D6E6E]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="published" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0 h-10 border border-[#EBEBEB] bg-white px-4 rounded-lg">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-[13px] font-medium text-[#111827] !mt-0">Published</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" disabled={createItem.isPending || updateItem.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-lg font-medium text-[14px] h-11 mt-4">
                  {createItem.isPending || updateItem.isPending ? "Saving..." : "Save Portfolio Item"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#EBEBEB] pb-4">
        {[
          { id: "all", label: "All Items" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Drafts" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              activeTab === tab.id 
                ? "bg-[#111827] text-white" 
                : "text-[#6B7280] hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-[340px] bg-white border border-[#EBEBEB] rounded-2xl animate-pulse" />)}
        </div>
      ) : !filteredItems?.length ? (
        <div className="text-center py-20 bg-white border border-[#EBEBEB] rounded-2xl">
          <p className="text-[#6B7280] text-[14px]">No portfolio items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white flex flex-col group">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img src={item.images[0] || "https://placehold.co/600x400/EBEBEB/9CA3AF"} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 text-[11px] font-medium rounded-full ${item.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[12px] font-medium text-[#6B7280] mb-1">{item.category}</p>
                <h3 className="text-[16px] font-medium text-[#111827] mb-4">{item.title}</h3>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#EBEBEB]">
                  <span className="text-[12px] text-[#9CA3AF]">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-[#4B5563]" onClick={() => handleOpenModal(item)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
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