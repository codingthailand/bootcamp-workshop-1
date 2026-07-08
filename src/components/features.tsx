import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { Badge } from "@/components/ui/badge";

async function fetchProducts() {
  const products = await prisma.products.findMany({
    include: {
      categories: true
    },
    orderBy: { id: "desc" }
  });
  return products;
}

const Features = async () => {
  await connection();
  const products = await fetchProducts();

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-[clamp(1.75rem,4vw,32px)] font-bold tracking-[-0.03em]">
            All Kits
          </h2>
          <p className="mt-3 text-[15px] text-text-secondary">
            Browse our collection of premium design system files
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              key={product.id}
            >
              <div className="flex aspect-[3/2] items-center justify-center bg-muted">
                <span className="font-heading text-[48px] font-bold tracking-[-0.04em] text-muted-foreground/30">
                  {(product.name ?? "?").charAt(0)}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                    {product.name ?? "Untitled"}
                  </h3>
                  {product.categories && (
                    <Badge variant="secondary" className="text-[11px]">
                      {product.categories.name}
                    </Badge>
                  )}
                </div>
                <p className="text-[13px] leading-relaxed text-text-secondary line-clamp-2">
                  {product.description ?? "No description"}
                </p>
                {product.price != null && (
                  <p className="mt-auto pt-2 font-medium text-[15px] text-foreground">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
