import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/* ---------------------------------- money --------------------------------- */

export type CurrencyCode = "USD" | "GBP" | "NGN";

export const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: "$", rate: 1, label: "USD" },
  GBP: { symbol: "£", rate: 0.79, label: "GBP" },
  NGN: { symbol: "₦", rate: 1550, label: "NGN" },
};

export const COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN" as CurrencyCode },
  { code: "GB", name: "United Kingdom", currency: "GBP" as CurrencyCode },
  { code: "US", name: "United States", currency: "USD" as CurrencyCode },
  { code: "GH", name: "Ghana", currency: "USD" as CurrencyCode },
  { code: "KE", name: "Kenya", currency: "USD" as CurrencyCode },
  { code: "ZA", name: "South Africa", currency: "USD" as CurrencyCode },
  { code: "CA", name: "Canada", currency: "USD" as CurrencyCode },
  { code: "IE", name: "Ireland", currency: "GBP" as CurrencyCode },
  { code: "FR", name: "France", currency: "GBP" as CurrencyCode },
  { code: "AE", name: "United Arab Emirates", currency: "USD" as CurrencyCode },
];

export function formatMoney(amountUsd: number, currency: CurrencyCode) {
  const { symbol, rate } = CURRENCIES[currency];
  const value = amountUsd * rate;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  })}`;
}

/* ---------------------------------- cart ---------------------------------- */

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  size: string;
  color: string;
  price: number;
  quantity: number;
};

type ShopState = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  country: string | null;
  setCountry: (c: string) => void;
  cart: CartLine[];
  addToCart: (line: CartLine) => void;
  removeLine: (index: number) => void;
  setQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  session: Session | null;
  authReady: boolean;
};

const ShopContext = createContext<ShopState | null>(null);

const CART_KEY = "whs.cart";
const CUR_KEY = "whs.currency";
const COUNTRY_KEY = "whs.country";

export function ShopProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [country, setCountryState] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CUR_KEY) as CurrencyCode | null;
      if (c && c in CURRENCIES) setCurrencyState(c);
      const co = localStorage.getItem(COUNTRY_KEY);
      if (co) setCountryState(co);
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setCart(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const persistCart = (next: CartLine[]) => {
    setCart(next);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const value: ShopState = useMemo(
    () => ({
      currency,
      setCurrency: (c) => {
        setCurrencyState(c);
        try {
          localStorage.setItem(CUR_KEY, c);
        } catch {
          /* ignore */
        }
      },
      country,
      setCountry: (c) => {
        setCountryState(c);
        try {
          localStorage.setItem(COUNTRY_KEY, c);
        } catch {
          /* ignore */
        }
      },
      cart,
      addToCart: (line) => {
        const i = cart.findIndex(
          (l) => l.productId === line.productId && l.size === line.size && l.color === line.color,
        );
        if (i >= 0) {
          const next = [...cart];
          next[i] = { ...next[i], quantity: next[i].quantity + line.quantity };
          persistCart(next);
        } else {
          persistCart([...cart, line]);
        }
      },
      removeLine: (index) => persistCart(cart.filter((_, i) => i !== index)),
      setQuantity: (index, qty) =>
        persistCart(cart.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, qty) } : l))),
      clearCart: () => persistCart([]),
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      subtotal: cart.reduce((n, l) => n + l.quantity * l.price, 0),
      session,
      authReady,
    }),
    [currency, country, cart, session, authReady],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

/* -------------------------------- shipping -------------------------------- */

export const FREE_SHIPPING_THRESHOLD = 250; // USD

export function shippingFor(country: string | null, subtotal: number, method: "standard" | "express") {
  if (method === "standard" && subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const zone = country === "NG" ? 12 : country === "GB" || country === "IE" ? 8 : country === "US" ? 10 : 18;
  return method === "express" ? zone + 15 : zone;
}
