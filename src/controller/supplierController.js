import prisma from "../config/prisma.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers", error: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, phone, address } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, contactEmail, phone, address, userId: req.user.id }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: "Failed to create supplier", error: error.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findFirst({
      where: { id: parseInt(id), userId: req.user.id },
      include: { products: true }
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplier", error: error.message });
  }
};
