import { createFileRoute, Link } from "@tanstack/react-router";
import { formatMoney, useShop } from "@/lib/shop-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping bag — WET HER SPOON" },
      { name: "description", content: "Review the dresses in your Wet Her Spoon shopping bag." },
      { property: "og:title", content: "Shopping bag — WET HER SPOON" },
      { property: "og:description", content: "Review the dresses in your shopping bag." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, currency, setQuantity, removeLine, subtotal } = useShop();

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

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-2xl tracking-[0.1em]">Shopping bag</h1>
      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-border border-y border-border">
          {cart.map((line, i) => (
            <div key={`${line.productId}-${line.size}-${line.color}`} className="flex gap-4 py-5">
              <Link to="/product/$slug" params={{ slug: line.slug }} className="w-24 shrink-0">
                {line.image ? (
                  <img src={line.image} alt={line.name} className="aspect-[3/4] w-full object-cover" />
                ) : (
                  <div className="aspect-[3/4] w-full bg-secondary" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <p className="label-xs">{line.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {line.color} · Size {line.size}
                </p>
                <p className="mt-1 text-sm">{formatMoney(line.price, currency)}</p>
                <div className="mt-auto flex items-center gap-4 pt-3">
                  <select
                    aria-label="Quantity"
                    className="label-xs cursor-pointer border border-input px-2 py-1"
                    value={line.quantity}
                    onChange={(e) => setQuantity(i, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="label-xs underline underline-offset-4 text-muted-foreground"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-border p-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal, currency)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Shipping calculated at checkout.</p>
          <Link to="/checkout" className="btn-solid mt-6 w-full">
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
