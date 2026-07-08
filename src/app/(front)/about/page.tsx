import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-20">
      <h1 className="font-heading text-[clamp(2rem,5vw,48px)] font-bold tracking-[-0.04em]">
        About Genesis
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
        Genesis is a curated marketplace for design system files. We help developers
        and designers find production-ready UI kits, component libraries, and design
        tokens — all in one place.
      </p>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
        API Key: {process.env.API_KEY}
      </p>
      <hr className="my-8 border-border" />
      <Button asChild variant="outline">
        <Link href="/">Back Home</Link>
      </Button>
    </div>
  );
}
