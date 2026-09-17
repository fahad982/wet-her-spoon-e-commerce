import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CURRENCIES, useShop, type CurrencyCode } from "@/lib/shop-context";
import { fetchProducts } from "@/lib/shop-data";
import logo from "@/assets/logo.png";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Kept small on desktop so it doesn't clash with the centered wordmark —
// everything else lives in the "More" dropdown next to it.
const PRIMARY_NAV = [
  { label: "Home", to: "/", search: {} },
  { label: "Sale", to: "/shop", search: { category: "sale" } },
  { label: "Category", to: "/shop", search: {} },
  { label: "About", to: "/about", search: {} },
] as const;

const MORE_NAV = [
  { label: "New In", to: "/shop", search: { category: "new-in" } },
  { label: "Dresses", to: "/shop", search: { category: "dresses" } },
  { label: "Occasion", to: "/shop", search: { category: "occasion" } },
  { label: "Reviews", to: "/reviews", search: {} },
  { label: "FAQ", to: "/faq", search: {} },
  { label: "Journal", to: "/journal", search: {} },
] as const;

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

export function Header() {
  const { cartCount, currency, setCurrency, session } = useShop();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: searchOpen,
  });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.is_published && (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [products, query]);

  // Cmd/Ctrl+K opens search, matching the shortcut convention this component supports.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function goToProduct(slug: string) {
    setSearchOpen(false);
    setQuery("");
    navigate({ to: "/product/$slug", params: { slug } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-6">
          <button
            aria-label="Menu"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <nav className="hidden items-center gap-6 lg:flex">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                className="label-xs text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger className="label-xs flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground">
                More <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MORE_NAV.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link to={item.to} search={item.search}>
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        <Link to="/" className="min-w-0 text-center">
          <img src={logo} alt="Wet Her Spoon" className="mx-auto h-12 w-auto object-contain sm:h-14 md:h-16" />
        </Link>

        <div className="flex shrink-0 items-center justify-end gap-3 sm:gap-4">
          <button aria-label="Search" type="button" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </button>
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
        <nav className="flex flex-col gap-4 border-t border-border px-4 py-5 lg:hidden">
          {ALL_NAV.map((item) => (
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

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search dresses…" value={query} onValueChange={setQuery} />
        <CommandList>
          {query.trim() && results.length === 0 && <CommandEmpty>No dresses found.</CommandEmpty>}
          {results.length > 0 && (
            <CommandGroup heading="Dresses">
              {results.map((p) => (
                <CommandItem key={p.id} value={p.name} onSelect={() => goToProduct(p.slug)}>
                  {p.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}
