import express from "express";
import prisma from "../config/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in testPrisma.js:", error);
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Prisma database error",
    });
  }
});

export default router;