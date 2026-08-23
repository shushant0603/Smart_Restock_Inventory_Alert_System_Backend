import express from "express";
import Transaction from "../models/transaction.js";
import createTransaction from "../controller/Transaction.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("productId", "name category")
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions", error: error.message });
  }
});

router.post("/",createTransaction);     

export default router;
