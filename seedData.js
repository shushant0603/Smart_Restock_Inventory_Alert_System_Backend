import prisma from "./src/config/prisma.js";

const categories = ["Electronics", "Stationery", "Office Supplies", "Furniture", "IT Equipment"];
const productAdjectives = ["Pro", "Max", "Ultra", "Basic", "Advanced", "Smart", "Eco", "Premium"];
const productTypes = {
  "Electronics": ["Laptop", "Monitor", "Keyboard", "Mouse", "Tablet"],
  "Stationery": ["Pen", "Notebook", "Markers", "Sticky Notes", "Stapler"],
  "Office Supplies": ["Printer Paper", "Folders", "Binders", "Tape", "Paper Clips"],
  "Furniture": ["Desk", "Chair", "Cabinet", "Bookshelf", "Table"],
  "IT Equipment": ["Router", "Switch", "Server", "Cable", "Webcam"]
};

async function main() {
  console.log("Starting database seeding...");

  // 1. Create 10 Suppliers
  const suppliersData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Supplier ${i + 1} International`,
    contactEmail: `sales@supplier${i + 1}intl.com`,
    phone: `+1-555-010${i}`,
    address: `${1000 + i} Commerce Blvd, Business City, BC`,
  }));

  const createdSuppliers = [];
  for (const sup of suppliersData) {
    const created = await prisma.supplier.create({ data: sup });
    createdSuppliers.push(created);
  }
  console.log(`✅ Successfully created ${createdSuppliers.length} suppliers.`);

  // 2. Create 100 Products
  const productsData = Array.from({ length: 100 }).map((_, i) => {
    const category = categories[i % categories.length];
    const typeList = productTypes[category];
    const type = typeList[i % typeList.length];
    const adjective = productAdjectives[i % productAdjectives.length];
    
    // Distribute products evenly across suppliers
    const supplier = createdSuppliers[i % createdSuppliers.length]; 
    
    const currentStock = Math.floor(Math.random() * 500) + 10;
    const minimumStock = Math.floor(Math.random() * 50) + 10;
    const price = Math.floor(Math.random() * 900) + 10 + (Math.random() > 0.5 ? 0.99 : 0.0);

    return {
      name: `${adjective} ${type} v${(i % 5) + 1}`,
      category: category,
      currentStock: currentStock,
      minimumStock: minimumStock,
      reorderQuantity: Math.floor(Math.random() * 20) + 5,
      price: parseFloat(price.toFixed(2)),
      supplierId: supplier.id,
    };
  });

  const result = await prisma.product.createMany({
    data: productsData,
  });

  console.log(`✅ Successfully created ${result.count} products.`);
  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
