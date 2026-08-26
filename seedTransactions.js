import prisma from "./src/config/prisma.js";

async function main() {
  console.log("Starting transaction seeding...");

  // Fetch all existing products to link transactions
  const products = await prisma.product.findMany();
  if (products.length === 0) {
    console.error("No products found! Please run seedData.js first.");
    process.exit(1);
  }

  const transactionsData = [];
  const now = new Date();
  
  // Generate 300 transactions spread out over the last 30 days
  for (let i = 0; i < 300; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    
    // 70% chance of SALE, 30% chance of RECEIPT
    const type = Math.random() > 0.3 ? "SALE" : "RECEIPT";
    const quantity = Math.floor(Math.random() * 50) + 1; // 1 to 50 items
    
    // Generate a random date in the past 30 days
    const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    transactionsData.push({
      productId: product.id,
      type: type,
      quantity: quantity,
      note: type === "SALE" ? "Automated sale" : "Restock shipment",
      createdAt: pastDate,
      updatedAt: pastDate
    });
  }

  // Sort them by createdAt so they appear chronologically in logs (optional but nice)
  transactionsData.sort((a, b) => a.createdAt - b.createdAt);

  const result = await prisma.transaction.createMany({
    data: transactionsData,
  });

  console.log(`✅ Successfully created ${result.count} transactions for historical data.`);
}

main()
  .catch((e) => {
    console.error("Error during transaction seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
