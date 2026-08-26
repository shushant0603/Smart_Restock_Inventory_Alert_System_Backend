import express from "express";
import { getAllSuppliers, createSupplier, getSupplierById } from "../controller/supplierController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllSuppliers);
router.post("/", protect, createSupplier);
router.get("/:id", protect, getSupplierById);

export default router;
