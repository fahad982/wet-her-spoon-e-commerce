import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border px-4 py-14 md:px-8">
      <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <img src={logo} alt="Wet Her Spoon" className="h-12 w-auto object-contain" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Dresses, made to be worn everywhere. Shipped worldwide.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="label-xs text-muted-foreground">Shop</p>
          <Link to="/shop" search={{ category: "new-in" }} className="text-sm">
            New In
          </Link>
          <Link to="/shop" search={{ category: "dresses" }} className="text-sm">
            Dresses
          </Link>
          <Link to="/shop" search={{ category: "sale" }} className="text-sm">
            Sale
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <p className="label-xs text-muted-foreground">Help</p>
          <Link to="/account" className="text-sm">
            My account
          </Link>
          <a href="mailto:hello@wetherspoon.shop" className="text-sm">
            Returns &amp; exchanges
          </a>
          <a href="mailto:hello@wetherspoon.shop" className="text-sm">
            Contact us
          </a>
          <Link to="/admin" className="text-sm">
            Admin
          </Link>
        </div>
      </div>
      <p className="label-xs mt-12 text-muted-foreground">
        © {new Date().getFullYear()} Wet Her Spoon
      </p>
    </footer>
  );
}
