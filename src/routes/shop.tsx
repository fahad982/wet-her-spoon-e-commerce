import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { fetchCategories, fetchProducts, SIZES, type Product } from "@/lib/shop-data";

type ShopSearch = {
  category?: string | undefined;
  size?: string | undefined;
  color?: string | undefined;
  max?: number | undefined;
  sort?: "new" | "price-asc" | "price-desc" | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search['category'] === "string" ? search['category'] : undefined,
    size: typeof search['size'] === "string" ? search['size'] : undefined,
    color: typeof search['color'] === "string" ? search['color'] : undefined,
    max: typeof search['max'] === "number" ? search['max'] : undefined,
    sort:
      search['sort'] === "price-asc" || search['sort'] === "price-desc" || search['sort'] === "new"
        ? search['sort']
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop all dresses — WET HER SPOON" },
      {
        name: "description",
        content: "Browse every Wet Her Spoon dress. Filter by size, colour, price and category.",
      },
      { property: "og:title", content: "Shop all dresses — WET HER SPOON" },
      { property: "og:description", content: "Filter by size, colour, price and category." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const colors = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => (p.product_variants ?? []).map((v) => v.color))),
      ).sort(),
    [products],
  );

  const setParam = (key: keyof ShopSearch, value: string | number | undefined) =>
    navigate({ search: (prev) => ({ ...prev, [key]: value || undefined }) });

  const filtered = useMemo(() => {
    const catSlug = search.category;
    const cat = categories.find((c) => c.slug === catSlug);
    let list: Product[] = products.filter((p) => {
      if (catSlug === "new-in") return p.is_new;
      if (catSlug && cat) return p.category_id === cat.id;
      return true;
    });
    if (search.size)
      list = list.filter((p) =>
        (p.product_variants ?? []).some((v) => v.size === search.size && v.stock > 0),
      );
    if (search.color)
      list = list.filter((p) => (p.product_variants ?? []).some((v) => v.color === search.color));
    if (search.max) list = list.filter((p) => p.price <= search.max!);
    if (search.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (search.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list;
  }, [products, categories, search]);

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-2xl tracking-[0.1em]">
        {categories.find((c) => c.slug === search.category)?.name ?? "All dresses"}
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-4">
        <select
          aria-label="Category"
          className="label-xs cursor-pointer bg-transparent outline-none"
          value={search.category ?? ""}
          onChange={(e) => setParam("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Size"
          className="label-xs cursor-pointer bg-transparent outline-none"
          value={search.size ?? ""}
          onChange={(e) => setParam("size", e.target.value)}
        >
          <option value="">All sizes</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Colour"
          className="label-xs cursor-pointer bg-transparent outline-none"
          value={search.color ?? ""}
          onChange={(e) => setParam("color", e.target.value)}
        >
          <option value="">All colours</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Max price"
          className="label-xs cursor-pointer bg-transparent outline-none"
          value={search.max ? String(search.max) : ""}
          onChange={(e) => setParam("max", e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Any price</option>
          {[100, 150, 200].map((v) => (
            <option key={v} value={v}>
              Under ${v}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort"
          className="label-xs ml-auto cursor-pointer bg-transparent outline-none"
          value={search.sort ?? "new"}
          onChange={(e) => setParam("sort", e.target.value)}
        >
          <option value="new">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No pieces match these filters.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
