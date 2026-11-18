import ContactForm from "@/components/ContactForm";
import RevealText from "@/components/RevealText";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Raouf Rezouali for opportunities or feedback.",
};

export default function ContactPage() {
  return (
    <article className="flex max-w-2xl flex-col gap-12 py-16 sm:py-24">
      <RevealText
        as="h1"
        trigger="load"
        text="Say hello."
        accent={["hello."]}
        className="display text-[clamp(3rem,8vw,6rem)]"
      />

      <ContactForm />
    </article>
  );
}
