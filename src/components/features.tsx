import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

async function fetchProducts() {
  const products = await prisma.products.findMany({
    include: {
      categories: true
    },
    orderBy: { id: 'desc' }
  });
  return products;
}

const Features = async () => {
  await connection();
  const products = await fetchProducts();

  return (
    <div className="px-6 py-20">
      <h2 className="mx-auto max-w-3xl text-center font-medium text-4xl tracking-[-0.045em] sm:text-[2.75rem]">
        รายการสินค้าทั้งหมด
      </h2>
      <div className="mx-auto mt-10 grid max-w-(--breakpoint-lg) gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            className="flex flex-col rounded-xl border bg-card p-6"
            key={product.id}
          >
            <div className="mb-5">
              ID: {product.id} Categroy: {product.categories?.name}
            </div>
            <span className="font-medium text-lg">{product.name}</span>
            <p className="mt-1 text-[15px] text-foreground/80">
              {product.description} ราคา: {product.price?.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Features;
