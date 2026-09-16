import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WET HER SPOON" },
      { name: "description", content: "The story behind Wet Her Spoon." },
      { property: "og:title", content: "About — WET HER SPOON" },
      { property: "og:description", content: "The story behind Wet Her Spoon." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-3xl tracking-[0.08em] md:text-4xl">Our story</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        This is placeholder copy — swap this out with your real brand story: why you started
        Wet Her Spoon, what you make, and who it's for. A paragraph or two is usually enough.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        You can add more sections here later — materials and craftsmanship, sizing philosophy,
        sustainability, or anything else that matters to your customers.
      </p>
      <Link to="/shop" search={{}} className="btn-outline mt-10 inline-flex">
        Shop the collection
      </Link>
    </div>
  );
}
