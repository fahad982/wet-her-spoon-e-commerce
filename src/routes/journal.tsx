import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — WET HER SPOON" },
      { name: "description", content: "Stories, styling notes and news from Wet Her Spoon." },
      { property: "og:title", content: "Journal — WET HER SPOON" },
      { property: "og:description", content: "Stories, styling notes and news from Wet Her Spoon." },
    ],
  }),
  component: Journal,
});

function Journal() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8 md:py-24">
      <h1 className="font-display text-3xl tracking-[0.08em] md:text-4xl">Journal</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        No posts yet — this is where styling notes, lookbooks and news will live.
      </p>
      <Link to="/shop" search={{}} className="btn-outline mt-10 inline-flex">
        Shop the collection
      </Link>
    </div>
  );
}
