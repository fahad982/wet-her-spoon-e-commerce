import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useShop } from "@/lib/shop-context";
import { claimOwnerRole } from "@/lib/admin.functions";
import {
  fetchAllProductsAdmin,
  fetchCategories,
  fetchIsAdmin,
  slugify,
  SIZES,
  type Product,
} from "@/lib/shop-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — WET HER SPOON" },
      { name: "description", content: "Manage products, stock and customer orders for Wet Her Spoon." },
      { property: "og:title", content: "Admin — WET HER SPOON" },
      { property: "og:description", content: "Manage products, stock and orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

type VariantDraft = { id?: string; size: string; color: string; color_hex: string; stock: number };

type Draft = {
  id?: string;
  name: string;
  description: string;
  composition: string;
  price: string;
  compare_at_price: string;
  category_id: string;
  images: string;
  is_published: boolean;
  is_new: boolean;
  variants: VariantDraft[];
};

const emptyDraft = (): Draft => ({
  name: "",
  description: "",
  composition: "",
  price: "",
  compare_at_price: "",
  category_id: "",
  images: "",
  is_published: false,
  is_new: true,
  variants: [{ size: "S", color: "Black", color_hex: "#000000", stock: 5 }],
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session, authReady } = useShop();
  const userId = session?.user.id;
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (authReady && !session) navigate({ to: "/auth" });
  }, [authReady, session, navigate]);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: () => fetchIsAdmin(userId),
  });

  if (!session || roleLoading)
    return <p className="px-4 py-20 text-sm text-muted-foreground md:px-8">Loading…</p>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center md:px-8">
        <h1 className="text-2xl tracking-[0.1em]">Admin access only</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is for the shop owner. If this is your shop and no owner has been set up yet,
          claim it below.
        </p>
        <button
          type="button"
          className="btn-solid mt-8"
          onClick={async () => {
            try {
              const res = await claimOwnerRole();
              if (res.granted) {
                toast.success("You are now the owner");
                qc.invalidateQueries({ queryKey: ["is-admin", userId] });
              } else toast.error(res.reason);
            } catch {
              toast.error("Could not claim owner access");
            }
          }}
        >
          Claim owner access
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-2xl tracking-[0.1em]">Admin</h1>
      <div className="mt-6 flex gap-6 border-b border-border">
        {(["products", "orders"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`label-xs -mb-px border-b-2 pb-3 ${
              tab === t ? "border-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <ProductsTab draft={draft} setDraft={setDraft} />
      ) : (
        <OrdersTab />
      )}
    </div>
  );
}

/* -------------------------------- products -------------------------------- */

function ProductsTab({
  draft,
  setDraft,
}: {
  draft: Draft | null;
  setDraft: (d: Draft | null) => void;
}) {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAllProductsAdmin,
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const editProduct = (p: Product) =>
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description,
      composition: p.composition,
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      category_id: p.category_id ?? "",
      images: (p.images ?? []).join("\n"),
      is_published: p.is_published,
      is_new: p.is_new,
      variants: (p.product_variants ?? []).map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        color_hex: v.color_hex,
        stock: v.stock,
      })),
    });

  const togglePublish = async (p: Product) => {
    const { error } = await supabase
      .from("products")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success(p.is_published ? "Hidden from the shop" : "Now live in the shop");
      refresh();
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    await supabase.from("product_variants").delete().eq("product_id", p.id);
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      refresh();
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      const payload = {
        name: draft.name,
        slug: slugify(draft.name),
        description: draft.description,
        composition: draft.composition,
        price: Number(draft.price || 0),
        compare_at_price: draft.compare_at_price ? Number(draft.compare_at_price) : null,
        category_id: draft.category_id || null,
        images: draft.images
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        is_published: draft.is_published,
        is_new: draft.is_new,
      };

      let productId = draft.id;
      if (productId) {
        const { error } = await supabase.from("products").update(payload).eq("id", productId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
      }

      await supabase.from("product_variants").delete().eq("product_id", productId!);
      if (draft.variants.length) {
        const { error } = await supabase.from("product_variants").insert(
          draft.variants.map((v) => ({
            product_id: productId!,
            size: v.size,
            color: v.color,
            color_hex: v.color_hex,
            stock: Number(v.stock) || 0,
          })),
        );
        if (error) throw error;
      }

      toast.success("Product saved");
      setDraft(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File): Promise<void> => {
    if (!draft) return;
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    if (!data?.signedUrl) {
      toast.error("Photo uploaded but could not be linked");
      return;
    }
    setDraft({ ...draft, images: [draft.images, data.signedUrl].filter(Boolean).join("\n") });
    toast.success("Photo added");
  };

  if (draft) {
    const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
    return (
      <form onSubmit={save} className="mt-8 grid max-w-2xl gap-4">
        <p className="label-xs text-muted-foreground">
          {draft.id ? "Edit product" : "New product"}
        </p>
        <input
          className="field"
          required
          placeholder="Product name"
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        <textarea
          className="field min-h-24"
          placeholder="Description"
          value={draft.description}
          onChange={(e) => set({ description: e.target.value })}
        />
        <input
          className="field"
          placeholder="Fabric / composition"
          value={draft.composition}
          onChange={(e) => set({ composition: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="field"
            required
            type="number"
            step="0.01"
            placeholder="Price (USD)"
            value={draft.price}
            onChange={(e) => set({ price: e.target.value })}
          />
          <input
            className="field"
            type="number"
            step="0.01"
            placeholder="Was-price (optional)"
            value={draft.compare_at_price}
            onChange={(e) => set({ compare_at_price: e.target.value })}
          />
        </div>
        <select
          className="field"
          aria-label="Category"
          value={draft.category_id}
          onChange={(e) => set({ category_id: e.target.value })}
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <p className="label-xs text-muted-foreground">Photos</p>
          <textarea
            className="field mt-2 min-h-20"
            placeholder="One photo link per line"
            value={draft.images}
            onChange={(e) => set({ images: e.target.value })}
          />
          <input
            type="file"
            accept="image/*"
            className="mt-2 text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_published}
              onChange={(e) => set({ is_published: e.target.checked })}
            />
            Live in the shop
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_new}
              onChange={(e) => set({ is_new: e.target.checked })}
            />
            Show under New In
          </label>
        </div>

        <div className="border border-border p-4">
          <p className="label-xs text-muted-foreground">Sizes, colours &amp; stock</p>
          <div className="mt-3 grid gap-2">
            {draft.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_70px_80px_auto] items-center gap-2">
                <select
                  aria-label="Size"
                  className="field"
                  value={v.size}
                  onChange={(e) =>
                    set({
                      variants: draft.variants.map((x, j) =>
                        j === i ? { ...x, size: e.target.value } : x,
                      ),
                    })
                  }
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  placeholder="Colour"
                  value={v.color}
                  onChange={(e) =>
                    set({
                      variants: draft.variants.map((x, j) =>
                        j === i ? { ...x, color: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  type="color"
                  aria-label="Colour swatch"
                  className="h-10 w-full border border-input"
                  value={v.color_hex}
                  onChange={(e) =>
                    set({
                      variants: draft.variants.map((x, j) =>
                        j === i ? { ...x, color_hex: e.target.value } : x,
                      ),
                    })
                  }
                />
                <input
                  className="field"
                  type="number"
                  aria-label="Stock"
                  value={v.stock}
                  onChange={(e) =>
                    set({
                      variants: draft.variants.map((x, j) =>
                        j === i ? { ...x, stock: Number(e.target.value) } : x,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  className="label-xs underline underline-offset-4"
                  onClick={() => set({ variants: draft.variants.filter((_, j) => j !== i) })}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="label-xs mt-3 underline underline-offset-4"
            onClick={() =>
              set({
                variants: [
                  ...draft.variants,
                  { size: "S", color: "Black", color_hex: "#000000", stock: 0 },
                ],
              })
            }
          >
            Add a size / colour
          </button>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-solid" disabled={busy}>
            {busy ? "Saving…" : "Save product"}
          </button>
          <button type="button" className="btn-outline" onClick={() => setDraft(null)}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-8">
      <button type="button" className="btn-solid" onClick={() => setDraft(emptyDraft())}>
        Add a product
      </button>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {products.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 py-4">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="h-20 w-16 object-cover" />
            ) : (
              <div className="h-20 w-16 bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="label-xs">{p.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ${p.price} · {(p.product_variants ?? []).reduce((n, v) => n + v.stock, 0)} in stock ·{" "}
                {p.is_published ? "Live" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="label-xs underline underline-offset-4"
                onClick={() => editProduct(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className="label-xs underline underline-offset-4"
                onClick={() => togglePublish(p)}
              >
                {p.is_published ? "Unpublish" : "Publish"}
              </button>
              <button
                type="button"
                className="label-xs underline underline-offset-4 text-muted-foreground"
                onClick={() => deleteProduct(p)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- orders --------------------------------- */

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  phone: string | null;
  currency: string;
  total: number;
  created_at: string;
  shipping_address: Record<string, unknown> | null;
  order_items: {
    id: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
};

function OrdersTab() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminOrder[];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    }
  };

  if (orders.length === 0)
    return <p className="mt-8 text-sm text-muted-foreground">No orders yet.</p>;

  return (
    <div className="mt-8 grid gap-6">
      {orders.map((o) => (
        <div key={o.id} className="border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="label-xs">{o.order_number}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString()} · {o.email}
                {o.phone ? ` · ${o.phone}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {o.currency} {o.total.toFixed(2)}
              </span>
              <select
                aria-label="Order status"
                className="field w-40"
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm">
            {o.order_items.map((it) => (
              <div key={it.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {it.product_name} · {it.color} · {it.size} × {it.quantity}
                </span>
                <span>${(it.unit_price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {o.shipping_address && (
            <p className="mt-4 text-xs text-muted-foreground">
              Ship to: {Object.values(o.shipping_address).filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
