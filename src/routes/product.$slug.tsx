import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SizeGuide } from "@/components/site/SizeGuide";
import { ProductCard } from "@/components/site/ProductCard";
import { formatMoney, useShop } from "@/lib/shop-context";
import { fetchProductBySlug, fetchProducts, SIZES } from "@/lib/shop-data";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — WET HER SPOON` },
      { name: "description", content: "Dress detail, sizes, colours and stock at Wet Her Spoon." },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — WET HER SPOON` },
      { property: "og:description", content: "Dress detail, sizes, colours and stock." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { currency, addToCart, session } = useShop();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const p = await fetchProductBySlug(slug);
      if (!p) throw notFound();
      return p;
    },
  });
  const { data: all = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });

  const variants = product?.product_variants ?? [];
  const colors = useMemo(
    () =>
      Array.from(new Map(variants.map((v) => [v.color, v.color_hex])).entries()).map(
        ([name, hex]) => ({ name, hex }),
      ),
    [variants],
  );
  const activeColor = color ?? colors[0]?.name ?? null;
  const selected = variants.find((v) => v.size === size && v.color === activeColor);
  const soldOut = !!size && (!selected || selected.stock <= 0);

  if (isLoading) return <p className="px-4 py-20 text-sm text-muted-foreground md:px-8">Loading…</p>;
  if (!product) return null;

  const related = all.filter((p) => p.id !== product.id);
  const youMayLike = related.filter((p) => p.category_id === product.category_id).slice(0, 4);
  const completeLook = related.filter((p) => !youMayLike.includes(p)).slice(0, 4);

  const handleAdd = () => {
    if (!size || !activeColor) return toast.error("Choose a size first");
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? null,
      size,
      color: activeColor,
      price: product.price,
      quantity: 1,
    });
    toast.success("Added to bag");
  };

  const handleWishlist = async () => {
    if (!session) return toast.error("Sign in to save pieces");
    const { error } = await supabase
      .from("wishlist_items")
      .insert({ user_id: session.user.id, product_id: product.id });
    if (error && !error.message.includes("duplicate")) toast.error(error.message);
    else toast.success("Saved to wishlist");
  };

  const handleNotify = async () => {
    if (!selected) return;
    const email = notifyEmail || session?.user.email || "";
    if (!email) return toast.error("Enter your email");
    const { error } = await supabase.from("notify_requests").insert({
      variant_id: selected.id,
      email,
      user_id: session?.user.id ?? null,
    });
    if (error) toast.error(error.message);
    else {
      setNotifyEmail("");
      toast.success("We'll email you when it's back");
    }
  };

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-2">
          {(product.images.length ? product.images : [null]).map((src, i) =>
            src ? (
              <img
                key={src}
                src={src}
                alt={`${product.name} view ${i + 1}`}
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div key="ph" className="aspect-[3/4] w-full bg-secondary" />
            ),
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:h-fit">
          <h1 className="text-2xl tracking-[0.08em]">{product.name}</h1>
          <p className="mt-2 text-sm">
            {formatMoney(product.price, currency)}
            {product.compare_at_price ? (
              <span className="ml-2 line-through opacity-60">
                {formatMoney(product.compare_at_price, currency)}
              </span>
            ) : null}
          </p>
          <p className="mt-5 max-w-prose text-sm text-muted-foreground">{product.description}</p>

          <div className="mt-8">
            <p className="label-xs text-muted-foreground">Colour</p>
            <div className="mt-3 flex gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColor(c.name)}
                  className={`h-7 w-7 rounded-full border ${
                    activeColor === c.name ? "border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="label-xs text-muted-foreground">Size</p>
              <SizeGuide />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => {
                const v = variants.find((x) => x.size === s && x.color === activeColor);
                const out = !v || v.stock <= 0;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`label-xs border px-4 py-2 ${
                      size === s ? "border-foreground bg-foreground text-background" : "border-border"
                    } ${out ? "opacity-40" : ""}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {soldOut ? (
            <div className="mt-8 border border-border p-4">
              <p className="label-xs">Sold out — notify me</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="email"
                  className="field"
                  placeholder="Email address"
                  value={notifyEmail || session?.user.email || ""}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                />
                <button type="button" className="btn-solid shrink-0" onClick={handleNotify}>
                  Notify me
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex gap-3">
              <button type="button" className="btn-solid flex-1" onClick={handleAdd}>
                Add to bag
              </button>
              <button
                type="button"
                aria-label="Save to wishlist"
                className="btn-outline px-4"
                onClick={handleWishlist}
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
          )}

          {product.composition ? (
            <p className="mt-8 text-xs text-muted-foreground">{product.composition}</p>
          ) : null}
        </div>
      </div>

      {youMayLike.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl tracking-[0.1em]">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {youMayLike.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {completeLook.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl tracking-[0.1em]">Complete the look</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {completeLook.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Link to="/shop" search={{}} className="label-xs mt-16 inline-block underline underline-offset-4">
        Back to shop
      </Link>
    </div>
  );
}
