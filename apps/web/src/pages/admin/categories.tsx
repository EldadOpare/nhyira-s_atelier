import { useState, useEffect } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, type Category } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Check, X, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { useAdminPage } from "@/lib/admin-page-context";

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { setHeader } = useAdminPage();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setHeader({ title: "Categories", subtitle: "These power the service list and the portfolio dropdown" });
  }, [setHeader]);

  const list = categories ?? [];

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    createCategory.mutate(name, { onSuccess: () => setNewName("") });
  };

  const handleSaveEdit = (id: number) => {
    const name = editName.trim();
    if (!name) return;
    updateCategory.mutate({ id, name }, { onSuccess: () => setEditingId(null) });
  };

  // Swapped a row with its neighbour by trading sort orders.
  const handleMove = (index: number, dir: -1 | 1) => {
    const a = list[index];
    const b = list[index + dir];
    if (!a || !b) return;
    updateCategory.mutate({ id: a.id, sortOrder: b.sortOrder });
    updateCategory.mutate({ id: b.id, sortOrder: a.sortOrder });
  };

  const handleDelete = (c: Category) => {
    if (confirm(`Delete "${c.name}"? Existing works keep their category text.`)) {
      deleteCategory.mutate(c.id);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-2xl">
      {/* Add new */}
      <div className="animate-admin-fade-up admin-card bg-white border border-[#E7E5E4] rounded-[10px] p-5">
        <p className="text-[11px] font-medium text-[#A8A29E] uppercase tracking-wider mb-2">Add a category</p>
        <div className="flex gap-2.5">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g. Bridal Showers"
            className="bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] focus-visible:border-[#0D6E6E] h-10 text-[13px]"
          />
          <Button onClick={handleAdd} disabled={createCategory.isPending || !newName.trim()}
            className="bg-[#0D6E6E] hover:bg-[#0A4F4F] text-white rounded-[8px] text-[13px] font-medium h-10 px-4 gap-1.5 shrink-0">
            <Plus size={15} /> Add
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="animate-admin-fade-up admin-card bg-white border border-[#E7E5E4] rounded-[10px] overflow-hidden" style={{ animationDelay: "80ms" }}>
        <div className="px-5 py-4 border-b border-[#F1F0EE]">
          <h2 className="text-[13px] font-medium text-[#111827]">All categories</h2>
        </div>

        {isLoading ? (
          <p className="p-5 text-[13px] text-[#AFAFAF]">Loading…</p>
        ) : !list.length ? (
          <p className="p-5 text-[13px] text-[#AFAFAF]">No categories yet. Add your first one above.</p>
        ) : (
          <div className="divide-y divide-[#F1F0EE]">
            {list.map((c, index) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                {/* Reorder */}
                <div className="flex flex-col">
                  <button onClick={() => handleMove(index, -1)} disabled={index === 0}
                    className="text-[#C7C0B6] hover:text-[#0D6E6E] disabled:opacity-30" aria-label="Move up">
                    <ChevronUp size={15} />
                  </button>
                  <button onClick={() => handleMove(index, 1)} disabled={index === list.length - 1}
                    className="text-[#C7C0B6] hover:text-[#0D6E6E] disabled:opacity-30" aria-label="Move down">
                    <ChevronDown size={15} />
                  </button>
                </div>

                {editingId === c.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(c.id); if (e.key === "Escape") setEditingId(null); }}
                      autoFocus
                      className="flex-1 bg-white rounded-[8px] border-[#E7E5E4] focus-visible:ring-[#0D6E6E] h-9 text-[13px]"
                    />
                    <button onClick={() => handleSaveEdit(c.id)} className="text-[#0D6E6E] hover:bg-[#0D6E6E]/10 rounded-[6px] p-1.5" aria-label="Save">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[#AFAFAF] hover:bg-[#F1F0EE] rounded-[6px] p-1.5" aria-label="Cancel">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-[14px] text-[#1C1917]">{c.name}</span>
                    <button onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                      className="text-[#C7C0B6] hover:text-[#0D6E6E] hover:bg-[#0D6E6E]/[0.06] rounded-[6px] p-1.5" aria-label="Rename">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c)}
                      className="text-[#C7C0B6] hover:text-red-500 hover:bg-red-50 rounded-[6px] p-1.5" aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
