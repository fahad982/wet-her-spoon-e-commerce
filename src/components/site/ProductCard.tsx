import { Link } from "@tanstack/react-router";
import { formatMoney, useShop } from "@/lib/shop-context";
import type { Product } from "@/lib/shop-data";

export function ProductCard({ product }: { product: Product }) {
  const { currency } = useShop();
  const colors = Array.from(new Set((product.product_variants ?? []).map((v) => v.color_hex)));
  const soldOut = (product.product_variants ?? []).every((v) => v.stock <= 0);

  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : null}
        {soldOut && (
          <span className="label-xs absolute left-3 top-3 bg-background px-2 py-1">Sold out</span>
        )}
        {!soldOut && product.is_new && (
          <span className="label-xs absolute left-3 top-3 bg-background px-2 py-1">New</span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="label-xs">{product.name}</p>
        <div className="flex items-center gap-2">
          {colors.slice(0, 4).map((hex) => (
            <span
              key={hex}
              className="h-2.5 w-2.5 rounded-full border border-border"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatMoney(product.price, currency)}
          {product.compare_at_price ? (
            <span className="ml-2 line-through opacity-60">
              {formatMoney(product.compare_at_price, currency)}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
