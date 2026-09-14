import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";
import { formatMoney, useShop } from "@/lib/shop-context";
import { fetchIsAdmin, type Product } from "@/lib/shop-data";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My account — WET HER SPOON" },
      { name: "description", content: "Manage your Wet Her Spoon details, wishlist and order history." },
      { property: "og:title", content: "My account — WET HER SPOON" },
      { property: "og:description", content: "Your details, wishlist and order history." },
    ],
  }),
  component: AccountPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  currency: string;
  total: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }[];
};

function AccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session, authReady, currency } = useShop();
  const userId = session?.user.id;

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authReady && !session) navigate({ to: "/auth" });
  }, [authReady, session, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: () => fetchIsAdmin(userId),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id, products(*, product_variants(*))")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; products: Product | null }[];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, currency, total, created_at, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, full_name: fullName, phone });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Details saved");
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    }
  };

  if (!session) return <p className="px-4 py-20 text-sm text-muted-foreground md:px-8">Loading…</p>;

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl tracking-[0.1em]">My account</h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="label-xs underline underline-offset-4">
              Owner dashboard
            </Link>
          )}
          <button
            type="button"
            className="label-xs underline underline-offset-4"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <section className="mt-10 max-w-md">
        <p className="label-xs text-muted-foreground">Your details</p>
        <form onSubmit={saveProfile} className="mt-4 grid gap-3">
          <input
            className="field"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="field"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input className="field opacity-60" value={session.user.email ?? ""} readOnly />
          <button type="submit" className="btn-solid" disabled={saving}>
            {saving ? "Saving…" : "Save details"}
          </button>
        </form>
      </section>

      <section className="mt-16">
        <p className="label-xs text-muted-foreground">Wishlist</p>
        {wishlist.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing saved yet.</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {wishlist
              .filter((w) => w.products)
              .map((w) => (
                <ProductCard key={w.id} product={w.products as Product} />
              ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <p className="label-xs text-muted-foreground">Order history</p>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-6 grid gap-6">
            {orders.map((o) => (
              <div key={o.id} className="border border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="label-xs">{o.order_number}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </p>
                  </div>
                  <p className="text-sm">{formatMoney(o.total, currency)}</p>
                </div>
                <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm">
                  {o.order_items.map((it) => (
                    <div key={it.id} className="flex justify-between gap-3">
                      <span className="text-muted-foreground">
                        {it.product_name} · {it.color} · {it.size} × {it.quantity}
                      </span>
                      <span>{formatMoney(it.unit_price * it.quantity, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
