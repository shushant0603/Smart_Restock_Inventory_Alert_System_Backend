import prisma from '../config/prisma.js';

const generateData = async () => {
  try {
    console.log('Starting seed process...');
    
    // 1. Get a user to attach the data to
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('No users found in the database. Please register a user first before seeding.');
      return;
    }
    const userId = user.id;
    console.log(`Seeding data for user: ${user.email}`);

    // 2. Create Suppliers
    const supplierNames = [
      "TechCorp Solutions",
      "Global Office Supplies",
      "MedQuip Distributors",
      "Apex Industrial",
      "Prime Provisions",
      "Nexus Hardware",
      "BlueWave Electronics"
    ];

    const createdSuppliers = [];
    for (const name of supplierNames) {
      const supplier = await prisma.supplier.create({
        data: {
          name,
          contactEmail: `contact@${name.replace(/\s+/g, '').toLowerCase()}.com`,
          phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
          address: `${Math.floor(100 + Math.random() * 9000)} Main St, Cityville, ST 12345`,
          userId
        }
      });
      createdSuppliers.push(supplier);
    }
    console.log(`Created ${createdSuppliers.length} suppliers.`);

    // 3. Create 100 Products
    const categories = ["Electronics", "Office Supplies", "Medical", "Hardware", "Consumables"];
    const productPrefixes = ["Pro", "Ultra", "Max", "Elite", "Smart", "Eco", "Basic", "Advanced"];
    const productNouns = ["Widget", "Gizmo", "Tool", "Kit", "System", "Device", "Module", "Station"];
    
    const createdProducts = [];
    for (let i = 1; i <= 100; i++) {
      const prefix = productPrefixes[Math.floor(Math.random() * productPrefixes.length)];
      const noun = productNouns[Math.floor(Math.random() * productNouns.length)];
      const supplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const currentStock = Math.floor(Math.random() * 200);
      
      const product = await prisma.product.create({
        data: {
          name: `${prefix} ${noun} X${i}`,
          category,
          currentStock,
          minimumStock: 20 + Math.floor(Math.random() * 30),
          reorderQuantity: 50 + Math.floor(Math.random() * 50),
          price: parseFloat((10 + Math.random() * 490).toFixed(2)),
          supplierId: supplier.id,
          userId
        }
      });
      createdProducts.push(product);
    }
    console.log(`Created ${createdProducts.length} products.`);

    // 4. Create Historical Sales Transactions
    console.log('Generating historical transactions...');
    let transactionCount = 0;
    const now = new Date();
    
    for (const product of createdProducts) {
      // 5-15 sales transactions per product
      const numSales = 5 + Math.floor(Math.random() * 11);
      for (let j = 0; j < numSales; j++) {
        // Random date in the past 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const transactionDate = new Date(now);
        transactionDate.setDate(now.getDate() - daysAgo);

        await prisma.transaction.create({
          data: {
            productId: product.id,
            type: "SALE",
            quantity: 1 + Math.floor(Math.random() * 10),
            note: "Historical Sale",
            createdAt: transactionDate,
            userId
          }
        });
        transactionCount++;
      }
    }
    console.log(`Created ${transactionCount} historical sales transactions.`);
    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
};

generateData();
