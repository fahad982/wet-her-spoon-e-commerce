import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — WET HER SPOON" },
      { name: "description", content: "Shipping, returns, sizing and payment questions answered." },
      { property: "og:title", content: "FAQ — WET HER SPOON" },
      { property: "og:description", content: "Shipping, returns, sizing and payment questions answered." },
    ],
  }),
  component: Faq,
});

// Placeholder questions and answers — replace the answer text with your
// real shipping, returns, sizing and payment policies.
const FAQS = [
  { q: "How long does shipping take?", a: "Add your real shipping timeframes here." },
  { q: "What is your return policy?", a: "Add your real returns and exchange policy here." },
  { q: "How do I find my size?", a: "Add a link to your size guide or the details here." },
  { q: "What payment methods do you accept?", a: "List the payment methods you actually support here." },
  { q: "Do you ship internationally?", a: "State which countries you currently ship to here." },
];

function Faq() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-3xl tracking-[0.08em] md:text-4xl">FAQ</h1>
      <Accordion type="single" collapsible className="mt-10">
        {FAQS.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="label-xs text-left">{item.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
