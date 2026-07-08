import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-6">
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#E8E8EC_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_20%,transparent_70%)]" />

      <div className="relative isolate max-w-4xl text-center">
        <Badge
          asChild
          className="mb-6"
          variant="secondary"
        >
          <Link href="#">
            Just released v1.0.0 <ArrowUpRight className="ml-0.5 size-3.5" />
          </Link>
        </Badge>
        <h1 className="font-heading text-[clamp(2.5rem,6vw,72px)] font-bold leading-[1.05] tracking-[-0.04em] text-foreground">
          Design systems<br />
          <span className="text-primary">built for developers</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          Discover, share, and download production-ready design system files.
          Thoughtfully crafted components that give you a solid foundation for any UI.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/product">
              Browse Kits <ArrowUpRight className="size-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
