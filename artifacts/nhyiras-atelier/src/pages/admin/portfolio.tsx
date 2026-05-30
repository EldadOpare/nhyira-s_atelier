import { useState } from "react";
import { useListPortfolio, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, getListPortfolioQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, X } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-4xl text-[#0A4F4F]">Portfolio</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenModal()} className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-none font-label tracking-widest h-10">
              <Plus className="mr-2" size={16} /> ADD NEW WORK
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#F9F5EE] border-[#0D6E6E]/20 p-8 rounded-[1rem]">
            <DialogHeader>
              <DialogTitle className="font-heading text-3xl text-[#0A4F4F] mb-6">
                {editingId ? "Edit Portfolio Item" : "New Portfolio Item"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">TITLE</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">CATEGORY</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">DESCRIPTION</FormLabel>
                    <FormControl><Textarea {...field} className="bg-white rounded-none border-[#0D6E6E]/30 min-h-[100px]" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-6">
                  <FormField control={form.control} name="packageDetails" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">PACKAGE DETAILS</FormLabel>
                      <FormControl><Textarea {...field} className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">ESTIMATED BUDGET</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div>
                  <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F] mb-3 block">IMAGES (URL)</FormLabel>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`images.${index}.url`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl><Input {...field} placeholder="https://..." className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} className="rounded-none border-[#0D6E6E]/30 text-red-500">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "" })} className="rounded-none border-[#0D6E6E]/30 font-label tracking-widest text-xs">
                      + ADD IMAGE
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 items-end">
                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F]">TAGS (COMMA SEPARATED)</FormLabel>
                      <FormControl><Input {...field} className="bg-white rounded-none border-[#0D6E6E]/30" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="published" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0 h-10 border border-[#0D6E6E]/30 bg-white px-3">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-label text-xs tracking-widest text-[#0A4F4F] !mt-0">PUBLISHED</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <Button type="submit" disabled={createItem.isPending || updateItem.isPending} className="w-full bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white font-label tracking-widest rounded-none h-12 mt-4">
                  {createItem.isPending || updateItem.isPending ? "SAVING..." : "SAVE PORTFOLIO ITEM"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-[#F9F5EE] rounded-[1rem] animate-pulse" />)}
        </div>
      ) : !items?.length ? (
        <div className="text-center py-20 bg-[#F9F5EE] border border-[#0D6E6E]/20 rounded-[1rem]">
          <p className="font-sans text-gray-500">No portfolio items yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="border border-[#0D6E6E]/20 rounded-[1rem] overflow-hidden bg-white flex flex-col group">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img src={item.images[0] || "https://placehold.co/600x400/F9F5EE/0D6E6E"} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2 py-1 text-[10px] font-label tracking-widest rounded-full ${item.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="font-label text-xs tracking-widest text-[#0D6E6E] mb-1">{item.category}</p>
                <h3 className="font-heading text-2xl text-[#0A4F4F] mb-4">{item.title}</h3>
                
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-[#0D6E6E]/10">
                  <span className="font-sans text-xs text-gray-400">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenModal(item)}>
                      <Edit2 size={14} className="text-[#0D6E6E]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} className="text-red-500" />
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