import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/site/ProductCard";
import { useShop } from "@/lib/shop-context";
import type { Product } from "@/lib/shop-data";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — WET HER SPOON" },
      { name: "description", content: "The Wet Her Spoon dresses you have saved to your account." },
      { property: "og:title", content: "Wishlist — WET HER SPOON" },
      { property: "og:description", content: "The dresses you have saved to your account." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { session, authReady } = useShop();
  const userId = session?.user.id;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("product_id, products(*, product_variants(*))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((r) => (r as unknown as { products: Product | null }).products)
        .filter((p): p is Product => !!p);
    },
  });

  if (authReady && !session) {
    return (
      <div className="px-4 py-24 text-center md:px-8">
        <h1 className="text-2xl tracking-[0.1em]">Wishlist</h1>
        <p className="mt-3 text-sm text-muted-foreground">Sign in to see your saved pieces.</p>
        <Link to="/auth" className="btn-solid mt-8">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-2xl tracking-[0.1em]">Wishlist</h1>
      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
