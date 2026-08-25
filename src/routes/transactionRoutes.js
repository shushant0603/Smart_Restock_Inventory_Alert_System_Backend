import express from "express";
import prisma from "../config/prisma.js";
import createTransaction from "../controller/Transaction.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

router.post("/", createTransaction);     

export default router;
