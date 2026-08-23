import express from "express";
import Product from "../models/product.js";
import Alert from "../models/Alert.js";

const router = express.Router();

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("productId", "name category currentStock minimumStock")
      .sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alerts", error: error.message });
  }
});

router.post("/alerts", async (req, res) => {
  try {
    const { productId } = req.body;

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: "Failed to create alert", error: error.message });
  }
});

export default router;
