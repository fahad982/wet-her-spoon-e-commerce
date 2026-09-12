import { supabase } from "@/integrations/supabase/client";

export type Variant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  color_hex: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  composition: string;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  images: string[];
  is_published: boolean;
  is_new: boolean;
  created_at: string;
  product_variants?: Variant[];
};

export type Category = { id: string; name: string; slug: string; sort_order: number };

export const SIZES = ["XS", "S", "M", "L", "XL"];

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

export async function fetchIsAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
