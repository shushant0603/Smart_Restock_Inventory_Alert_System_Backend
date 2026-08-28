import prisma from '../config/prisma.js';

const generateData = async () => {
  try {
    console.log('Starting seed process...');
    
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.error('No users found in the database. Please register a user first before seeding.');
      return;
    }

    console.log('Clearing old data...');
    await prisma.transaction.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.planningRequest.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplier.deleteMany();

    for (const user of users) {
      const userId = user.id;
      console.log(`Seeding data for user: ${user.email}`);

      // 2. Create Medicine Suppliers
      const supplierNames = [
        "PharmaCorp Global",
        "MediSupply Co.",
        "Global Health Logistics",
        "Apex Pharmaceuticals",
        "Prime Care Provisions",
        "Nexus Medical",
        "BlueWave Biotech"
      ];

      const createdSuppliers = [];
      for (const name of supplierNames) {
        const supplier = await prisma.supplier.create({
          data: {
            name,
            contactEmail: `contact@${name.replace(/\s+/g, '').toLowerCase()}.com`,
            phone: `+1-555-${Math.floor(1000 + Math.random() * 9000)}`,
            address: `${Math.floor(100 + Math.random() * 9000)} Health Blvd, MedCity, ST 12345`,
            userId
          }
        });
        createdSuppliers.push(supplier);
      }
      console.log(`Created ${createdSuppliers.length} medicine suppliers for ${user.email}.`);

      // 3. Create Medicine Products
      const categories = ["Antibiotics", "Painkillers", "Vaccines", "Cardiovascular", "Surgical Supplies"];
      const productPrefixes = ["Amoxi", "Para", "Ibu", "Cipro", "Ator", "Vaxo", "Oxy", "Azi"];
      const productNouns = ["cillin", "cetamol", "profen", "floxacin", "vastatin", "derm", "contin", "thromycin"];
      
      const createdProducts = [];
      for (let i = 1; i <= 50; i++) {
        const prefix = productPrefixes[Math.floor(Math.random() * productPrefixes.length)];
        const noun = productNouns[Math.floor(Math.random() * productNouns.length)];
        const supplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        const currentStock = Math.floor(Math.random() * 500);
        
        const product = await prisma.product.create({
          data: {
            name: `${prefix}${noun} ${Math.floor(10 + Math.random() * 90) * 10}mg`,
            category,
            currentStock,
            minimumStock: 50 + Math.floor(Math.random() * 50),
            reorderQuantity: 100 + Math.floor(Math.random() * 100),
            price: parseFloat((5 + Math.random() * 150).toFixed(2)),
            supplierId: supplier.id,
            userId
          }
        });
        createdProducts.push(product);
      }
      console.log(`Created ${createdProducts.length} medicine products for ${user.email}.`);

      // 4. Create Historical Transactions
      console.log(`Generating historical transactions for ${user.email}...`);
      let transactionCount = 0;
      const now = new Date();
      
      for (const product of createdProducts) {
        const numSales = 3 + Math.floor(Math.random() * 5);
        for (let j = 0; j < numSales; j++) {
          const daysAgo = Math.floor(Math.random() * 90);
          const transactionDate = new Date(now);
          transactionDate.setDate(now.getDate() - daysAgo);

          await prisma.transaction.create({
            data: {
              productId: product.id,
              type: "SALE",
              quantity: 5 + Math.floor(Math.random() * 20),
              note: "Hospital/Pharmacy Order",
              createdAt: transactionDate,
              userId
            }
          });
          transactionCount++;
        }
      }
      console.log(`Created ${transactionCount} historical transactions for ${user.email}.`);

      // 5. Create Dummy Planning Requests
      console.log(`Generating initial planning requests for ${user.email}...`);
      const requestTypes = ["Transfer Out", "Transfer In", "Replenishment"];
      const priorities = ["High", "Medium", "Low"];
      const requestCount = 5;
      
      for (let k = 0; k < requestCount; k++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const rType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        const priority = priorities[Math.floor(Math.random() * priorities.length)];
        
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + 2 + Math.floor(Math.random() * 10));
        const dateString = futureDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

        await prisma.planningRequest.create({
          data: {
            requestId: `PR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}-${k}-${user.id.substring(0,4)}`,
            type: rType,
            from: rType === "Replenishment" ? "Supplier" : (rType === "Transfer In" ? "DC-B" : "DC-A (You)"),
            to: rType === "Transfer Out" ? "DC-C" : "DC-A (You)",
            product: product.name,
            qty: 50 + Math.floor(Math.random() * 150),
            requiredDate: dateString,
            priority,
            status: "New",
            userId
          }
        });
      }
      console.log(`Created ${requestCount} planning requests for ${user.email}.`);
    }

    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error("Error in seed.js:", error);
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
};

generateData();
