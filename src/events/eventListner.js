import eventBus from "./eventEmitter.js";
import prisma from "../config/prisma.js";
import { sendLowStockEmail } from "../services/emailService.js";
import { sendSMS } from "../services/msg.services.js";
import { getIO } from "../socket/socketServer.js";

eventBus.on("transactionCreated", async (transaction) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(transaction.productId) }
        });
        if (!product) {
            console.error("Inventory update skipped: product not found", transaction.productId);
            return;
        }

        let updatedStock = product.currentStock;

        if (transaction.type === "SALE" || transaction.type === "CONSUMPTION") {
            updatedStock -= transaction.quantity;
        } else if (transaction.type === "RECEIPT") {
            updatedStock += transaction.quantity;
        } else if (transaction.type === "ADJUSTMENT") {
            updatedStock = transaction.quantity;
        }

        if (updatedStock < 0) {
            console.error("Inventory update skipped: insufficient stock", {
                productId: product.id,
                currentStock: product.currentStock,
                requestedQuantity: transaction.quantity,
                type: transaction.type,
            });
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: product.id },
            data: { currentStock: updatedStock }
        });

        eventBus.emit("inventoryUpdated", {
            transaction,
            product: updatedProduct,
            updatedStock,
        });

        console.log("Transaction event processed successfully", {
            transactionId: transaction.id,
            productId: product.id,
            updatedStock,
        });

        // Emit real-time update to all connected frontend clients
        const io = getIO();
        if (io) {
            io.emit("stockUpdated", {
                productId: product.id,
                currentStock: updatedStock,
            });
        }
    } catch (error) {
        console.error("transactionCreated handler failed:", error.message);
    }
});

eventBus.on("inventoryUpdated", async ({ transaction, product, updatedStock }) => {
    try {
        const isLowStock = updatedStock <= product.minimumStock;

        if (isLowStock) {
            const alertMessage = `${product.name} is low on stock`;
            const existingActiveAlert = await prisma.alert.findFirst({
                where: {
                    productId: product.id,
                    type: "LOW_STOCK",
                    status: "ACTIVE",
                }
            });

            if (!existingActiveAlert) {
                await prisma.alert.create({
                    data: {
                        productId: product.id,
                        message: alertMessage,
                        currentStock: updatedStock,
                        minimumStock: product.minimumStock,
                        status: "ACTIVE",
                        type: "LOW_STOCK",
                        userId: product.userId
                    }
                });
            } else {
                await prisma.alert.update({
                    where: { id: existingActiveAlert.id },
                    data: {
                        currentStock: updatedStock,
                        minimumStock: product.minimumStock
                    }
                });
            }

            eventBus.emit("lowStockDetected", {
                transaction,
                product: {
                    ...product,
                    currentStock: updatedStock,
                },
                message: alertMessage,
            });
            return;
        }

        await prisma.alert.deleteMany({
            where: { 
                productId: product.id, 
                type: "LOW_STOCK"
            }
        });
    } catch (error) {
        console.error("inventoryUpdated handler failed:", error.message);
    }
});

eventBus.on("lowStockDetected", async (payload) => {
    eventBus.emit("notifyLowStockByEmail", payload);
    eventBus.emit("notifyLowStockBySocket", payload);
    eventBus.emit("notifyLowStockBYSMS",payload);
    eventBus.emit("notifyLowStockBYWhatsapp",payload);
});

eventBus.on("notifyLowStockByEmail", async ({ product }) => {
    try {
        await sendLowStockEmail(product);
    } catch (error) {
        console.error("notifyLowStockByEmail handler failed:", error.message);
    }
});

eventBus.on("notifyLowStockBySocket", async ({ product, message }) => {
    try {
        const io = getIO();
        if (!io) {
            return;
        }

        io.emit("lowStockAlert", {
            productId: product.id,
            name: product.name,
            currentStock: product.currentStock,
            minimumStock: product.minimumStock,
            message,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("notifyLowStockBySocket handler failed:", error.message);
    }
});
eventBus.on("notifyLowStockBYSMS", async ({ product, message }) => {
    try {
        await sendSMS(process.env.ALERT_MOBILE, { message });
    } catch (error) {
        console.error("notifyLowStockBYSMS handler failed:", error.message);
    }
});
eventBus.on("notifyLowStockBYWhatsapp", async ({ product, message }) => {
    console.log(`WhatsApp Alert: ${message} for product ${product.name} (ID: ${product.id})`);
});
