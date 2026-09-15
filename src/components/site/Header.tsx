import { Link } from "@tanstack/react-router";
import { Heart, Menu, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { CURRENCIES, useShop, type CurrencyCode } from "@/lib/shop-context";

const NAV = [
  { label: "New In", to: "/shop", search: { category: "new-in" } },
  { label: "Dresses", to: "/shop", search: { category: "dresses" } },
  { label: "Occasion", to: "/shop", search: { category: "occasion" } },
  { label: "Sale", to: "/shop", search: { category: "sale" } },
];

export function Header() {
  const { cartCount, currency, setCurrency } = useShop();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 sm:gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-6">
          <button
            aria-label="Menu"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                className="label-xs text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link to="/" className="min-w-0 text-center">
          <span className="font-display block truncate text-[0.95rem] tracking-[0.14em] sm:text-xl sm:tracking-[0.22em] md:text-2xl">
            WET HER SPOON
          </span>
        </Link>

        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="label-xs cursor-pointer bg-transparent outline-none"
          >
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link to="/account" aria-label="Account">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Link>
          <Link to="/cart" aria-label="Shopping bag" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1 text-[10px] tabular-nums">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-4 border-t border-border px-4 py-5 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              onClick={() => setOpen(false)}
              className="label-xs"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
