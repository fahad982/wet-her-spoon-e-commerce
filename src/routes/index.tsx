import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchProducts } from "@/lib/shop-data";
const heroAsset = "/__l5e/assets-v1/c77eb22e-8188-4ce4-9b86-7a6e523d9c8e/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WET HER SPOON — Dresses, made to be worn everywhere" },
      {
        name: "description",
        content:
          "Shop the Wet Her Spoon dress collection: satin slips, tailored minis, chiffon maxis and more. Worldwide shipping.",
      },
      { property: "og:title", content: "WET HER SPOON — Dresses" },
      {
        property: "og:description",
        content: "Satin slips, tailored minis, chiffon maxis. Worldwide shipping.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const newIn = products.filter((p) => p.is_new).slice(0, 4);
  const featured = (newIn.length ? newIn : products).slice(0, 4);

  return (
    <div>
      <section className="relative">
        <img
          src={heroAsset}
          alt="Model wearing a Wet Her Spoon dress"
          className="h-[70vh] w-full object-cover md:h-[86vh]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-5 pb-14 text-center">
          <h1 className="font-display text-4xl tracking-[0.14em] text-white drop-shadow md:text-6xl">
            THE DRESS EDIT
          </h1>
          <Link to="/shop" search={{}} className="btn-solid bg-white text-black">
            Shop now
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl tracking-[0.1em]">New arrivals</h2>
          <Link to="/shop" search={{}} className="label-xs underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="grid gap-px bg-border md:grid-cols-3">
        {[
          { label: "Dresses", slug: "dresses" },
          { label: "Occasion", slug: "occasion" },
          { label: "Sale", slug: "sale" },
        ].map((c) => (
          <Link
            key={c.slug}
            to="/shop"
            search={{ category: c.slug }}
            className="flex h-48 items-center justify-center bg-background transition-colors hover:bg-secondary"
          >
            <span className="label-xs">{c.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
