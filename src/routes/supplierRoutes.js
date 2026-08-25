import express from "express";
import { getAllSuppliers, createSupplier, getSupplierById } from "../controller/supplierController.js";

const router = express.Router();

router.get("/", getAllSuppliers);
router.post("/", createSupplier);
router.get("/:id", getSupplierById);

export default router;
