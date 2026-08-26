import express from "express";
import prisma from "../config/prisma.js";
import createTransaction from "../controller/Transaction.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

router.post("/", protect, createTransaction);     

export default router;
