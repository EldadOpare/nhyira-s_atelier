import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

// The codegen client did not know about categories, so we talked to the API
// here by hand. Reads were public and writes carried the admin token.
const API = (import.meta.env.VITE_API_URL as string) || "";

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const categoriesQueryKey = ["categories"] as const;

export function useCategories() {
  return useQuery({
    queryKey: categoriesQueryKey,
    queryFn: async (): Promise<Category[]> => {
      const res = await fetch(`${API}/api/categories`);
      if (!res.ok) throw new Error("Could not load categories");
      return res.json();
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Could not add category");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, sortOrder }: { id: number; name?: string; sortOrder?: number }) => {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ name, sortOrder }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Could not update category");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API}/api/categories/${id}`, {
        method: "DELETE",
        headers: { ...(await authHeaders()) },
      });
      if (!res.ok) throw new Error("Could not delete category");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoriesQueryKey }),
  });
}
