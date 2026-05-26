import prisma from "../src/config/database";

async function main() {
  const products = await prisma.product.findMany({
    where: { status: "approved" },
    include: { artisan: true },
  });
  const pendingProducts = await prisma.product.findMany({
    where: { status: "pending_approval" },
    include: { artisan: true },
  });

  console.log(
    `Seed store ready: ${products.length} approved products, ${pendingProducts.length} pending products.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
