import express from "express";
import prisma from "../config/prisma.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/products", protect, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { supplier: true }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

router.post("/products", protect, async (req, res) => {
  try {
    const { supplier, ...productData } = req.body;
    
    let supplierRecord = await prisma.supplier.findFirst({
      where: { name: supplier, userId: req.user.id }
    });

    if (!supplierRecord) {
      supplierRecord = await prisma.supplier.create({
        data: { name: supplier, userId: req.user.id }
      });
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        supplierId: supplierRecord.id,
        userId: req.user.id
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
});

router.get("/dashboard", protect, async (req, res) => {
  try {
    const totalProducts = await prisma.product.count({ where: { userId: req.user.id } });
    
    // Calculate smart suggestions for ALL products
    const allProducts = await prisma.product.findMany({ where: { userId: req.user.id } });
    const LEAD_TIME_DAYS = 3;
    
    const suggestions = allProducts.map(product => {
      const safetyStock = product.minimumStock;
      const mockAvgDailyUsage = 5 + (product.id % 10);
      const targetStock = (mockAvgDailyUsage * LEAD_TIME_DAYS) + safetyStock;
      
      const reorderQuantity = Math.max(0, targetStock - product.currentStock);
      
      return {
        id: `sug_${product.id}`,
        productId: product.id,
        product,
        currentStock: product.currentStock,
        avgDailyUsage: mockAvgDailyUsage,
        targetStock,
        safetyStock,
        reorderQuantity
      };
    }).filter(s => s.reorderQuantity > 0);

    // Fetch transactions to generate REAL Sales Trend Data
    const salesTransactions = await prisma.transaction.findMany({
      where: {
        type: { in: ["SALE", "CONSUMPTION"] },
        userId: req.user.id
      },
      orderBy: { createdAt: "asc" }
    });

    const now = new Date();
    
    // Generate empty structures with zeros
    const generateEmptyTrend = () => {
      const weeklyLabels = Array.from({length: 7}, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", { weekday: 'short' });
      });
      
      const monthlyLabels = Array.from({length: 6}, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (5 - i));
        return d.toLocaleDateString("en-US", { month: 'short' });
      });
      
      const yearlyLabels = Array.from({length: 5}, (_, i) => {
        return (now.getFullYear() - (4 - i)).toString();
      });

      return {
        weekly: weeklyLabels.map(label => ({ label, sales: 0 })),
        monthly: monthlyLabels.map(label => ({ label, sales: 0 })),
        yearly: yearlyLabels.map(label => ({ label, sales: 0 }))
      };
    };

    const overallTrend = generateEmptyTrend();
    const productTrends = {};
    allProducts.forEach(p => {
      productTrends[p.id] = generateEmptyTrend();
    });

    // Helper to add sale to the right bucket
    const addSaleToBucket = (trendObj, transactionDate, quantity) => {
      const diffDays = Math.floor((now - transactionDate) / (1000 * 60 * 60 * 24));
      
      // Weekly bucket (last 7 days)
      if (diffDays <= 6) {
        const label = transactionDate.toLocaleDateString("en-US", { weekday: 'short' });
        const weekBucket = trendObj.weekly.find(b => b.label === label);
        if (weekBucket) weekBucket.sales += quantity;
      }
      
      // Monthly bucket (last 6 months)
      const diffMonths = (now.getFullYear() - transactionDate.getFullYear()) * 12 + (now.getMonth() - transactionDate.getMonth());
      if (diffMonths <= 5 && diffMonths >= 0) {
        const label = transactionDate.toLocaleDateString("en-US", { month: 'short' });
        const monthBucket = trendObj.monthly.find(b => b.label === label);
        if (monthBucket) monthBucket.sales += quantity;
      }
      
      // Yearly bucket (last 5 years)
      const diffYears = now.getFullYear() - transactionDate.getFullYear();
      if (diffYears <= 4 && diffYears >= 0) {
        const label = transactionDate.getFullYear().toString();
        const yearBucket = trendObj.yearly.find(b => b.label === label);
        if (yearBucket) yearBucket.sales += quantity;
      }
    };

    // Populate the buckets with actual data
    salesTransactions.forEach(t => {
      const tDate = new Date(t.createdAt);
      // Add to overall
      addSaleToBucket(overallTrend, tDate, t.quantity);
      
      // Add to product specific if exists
      if (productTrends[t.productId]) {
        addSaleToBucket(productTrends[t.productId], tDate, t.quantity);
      }
    });

    const outOfStockCount = allProducts.filter(p => p.currentStock === 0).length;

    const dashboardStats = {
      stats: {
        totalProducts,
        healthyStock: totalProducts - suggestions.length - outOfStockCount,
        lowStock: suggestions.length,
        outOfStock: outOfStockCount,
        totalProductsTrend: "+3.2% this month",
        healthyStockTrend: "91% of catalog",
        lowStockTrend: "Needs reorder soon",
        outOfStockTrend: "Action required",
      },
      trend: {
        overall: overallTrend,
        products: productTrends
      },
      products: allProducts.map(p => ({ id: p.id, name: p.name })),
      alerts: await prisma.alert.findMany({
        where: { userId: req.user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" }
      }),
      suggestions,
      recentActivity: []
    };

    res.status(200).json(dashboardStats);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
});

router.get("/alerts", protect, async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
});

router.post("/alerts", protect, async (req, res) => {
  try {
    const { productId, type, message, currentStock, minimumStock } = req.body;
    
    const productExists = await prisma.product.findFirst({ where: { id: parseInt(productId), userId: req.user.id } });
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alert = await prisma.alert.create({
      data: {
        productId: parseInt(productId),
        type,
        message,
        currentStock,
        minimumStock,
        userId: req.user.id
      }
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: "Failed to create alert", error: error.message });
  }
});

export default router;
