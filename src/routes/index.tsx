import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { fetchProducts } from "@/lib/shop-data";
import heroAsset from "@/assets/hero.jpg";

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
          fetchPriority="high"
          className="h-[62vh] w-full object-cover object-top sm:h-[72vh] md:h-[86vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-4 pb-10 text-center md:gap-5 md:pb-14">
          <h1 className="font-display text-[1.75rem] leading-tight tracking-[0.12em] text-white drop-shadow-lg sm:text-4xl md:text-6xl">
            THE DRESS EDIT
          </h1>
          <Link to="/shop" search={{}} className="btn-solid bg-white text-black">
            Shop now
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <Reveal className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl tracking-[0.1em]">New arrivals</h2>
          <Link to="/shop" search={{}} className="label-xs underline underline-offset-4">
            View all
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="grid gap-px bg-border md:grid-cols-3">
        {[
          { label: "Dresses", slug: "dresses" },
          { label: "Occasion", slug: "occasion" },
          { label: "Sale", slug: "sale" },
        ].map((c, i) => (
          <Reveal key={c.slug} delay={i * 100}>
            <Link
              to="/shop"
              search={{ category: c.slug }}
              className="flex h-48 items-center justify-center bg-background transition-colors hover:bg-secondary"
            >
              <span className="label-xs">{c.label}</span>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
