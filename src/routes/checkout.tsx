import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  COUNTRIES,
  CURRENCIES,
  formatMoney,
  shippingFor,
  useShop,
  type CurrencyCode,
} from "@/lib/shop-context";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — WET HER SPOON" },
      { name: "description", content: "Complete your Wet Her Spoon order: address, shipping and payment." },
      { property: "og:title", content: "Checkout — WET HER SPOON" },
      { property: "og:description", content: "Complete your order: address, shipping and payment." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    currency,
    setCurrency,
    country,
    setCountry,
    clearCart,
    session,
    authReady,
  } = useShop();

  const [countryCode, setCountryCode] = useState(country ?? "NG");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.user.email) setEmail((e) => e || session.user.email || "");
  }, [session]);

  useEffect(() => {
    if (authReady && !session) navigate({ to: "/auth" });
  }, [authReady, session, navigate]);

  const shipping = shippingFor(countryCode, subtotal, method);
  const total = subtotal + shipping;

  const onCountry = (code: string) => {
    setCountryCode(code);
    setCountry(code);
    const c = COUNTRIES.find((x) => x.code === code);
    if (c) setCurrency(c.currency);
  };

  if (cart.length === 0) {
    return (
      <div className="px-4 py-24 text-center md:px-8">
        <h1 className="text-2xl tracking-[0.1em]">Your bag is empty</h1>
        <Link to="/shop" search={{}} className="btn-solid mt-8">
          Shop dresses
        </Link>
      </div>
    );
  }

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          email,
          phone,
          country: countryCode,
          currency,
          fx_rate: CURRENCIES[currency].rate,
          shipping_address: { full_name: fullName, line1, city, postcode, country: countryCode },
          subtotal,
          shipping,
          total,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        cart.map((l) => ({
          order_id: order.id,
          product_id: l.productId,
          product_name: l.name,
          image: l.image,
          size: l.size,
          color: l.color,
          quantity: l.quantity,
          unit_price: l.price,
        })),
      );
      if (itemsError) throw itemsError;

      clearCart();
      toast.success("Order placed. We'll email you payment details shortly.");
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-2xl tracking-[0.1em]">Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-12 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-8">
          <section className="grid gap-3">
            <p className="label-xs text-muted-foreground">Country / region &amp; currency</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="field"
                aria-label="Country"
                value={countryCode}
                onChange={(e) => onCountry(e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="field"
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              >
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c].symbol} {c}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="grid gap-3">
            <p className="label-xs text-muted-foreground">Contact</p>
            <input
              className="field"
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="field"
              type="tel"
              required
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </section>

          <section className="grid gap-3">
            <p className="label-xs text-muted-foreground">Shipping address</p>
            <input
              className="field"
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="field"
              required
              placeholder="Address"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="field"
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                className="field"
                placeholder="Postcode / ZIP"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>
          </section>

          <section className="grid gap-3">
            <p className="label-xs text-muted-foreground">Shipping method</p>
            {(["standard", "express"] as const).map((m) => (
              <label
                key={m}
                className={`flex cursor-pointer items-center justify-between border p-4 text-sm ${
                  method === m ? "border-foreground" : "border-border"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  {m === "standard" ? "Standard (5–8 days)" : "Express (2–3 days)"}
                </span>
                <span>
                  {shippingFor(countryCode, subtotal, m) === 0
                    ? "Free"
                    : formatMoney(shippingFor(countryCode, subtotal, m), currency)}
                </span>
              </label>
            ))}
          </section>

          <section className="grid gap-3">
            <p className="label-xs text-muted-foreground">Payment</p>
            <div className="border border-border p-4 text-sm">
              <p className="label-xs">PayPal</p>
              <p className="mt-2 text-muted-foreground">
                Our PayPal business account is being finalised. Place your order now and we'll email
                a secure PayPal payment link to complete it.
              </p>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
          <p className="label-xs">Order summary</p>
          <div className="mt-4 grid gap-3">
            {cart.map((l) => (
              <div key={`${l.productId}-${l.size}-${l.color}`} className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">
                  {l.name} · {l.color} · {l.size} × {l.quantity}
                </span>
                <span>{formatMoney(l.price * l.quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal, currency)}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatMoney(shipping, currency)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="label-xs">Total</span>
              <span>{formatMoney(total, currency)}</span>
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-solid mt-6 w-full">
            {busy ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
