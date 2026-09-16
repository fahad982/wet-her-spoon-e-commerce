import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — WET HER SPOON" },
      { name: "description", content: "What customers are saying about Wet Her Spoon." },
      { property: "og:title", content: "Reviews — WET HER SPOON" },
      { property: "og:description", content: "What customers are saying about Wet Her Spoon." },
    ],
  }),
  component: Reviews,
});

function Reviews() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8 md:py-24">
      <h1 className="font-display text-3xl tracking-[0.08em] md:text-4xl">Reviews</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        No reviews yet — this page is ready to show real customer feedback as it comes in.
      </p>
      <Link to="/shop" search={{}} className="btn-outline mt-10 inline-flex">
        Shop the collection
      </Link>
    </div>
  );
}
