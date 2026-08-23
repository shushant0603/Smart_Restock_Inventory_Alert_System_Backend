import eventBus from "./eventEmitter.js";
import Product from "../models/product.js";
import Alert from "../models/Alert.js";
import { sendLowStockEmail } from "../services/emailService.js";
import { sendSMS } from "../services/msg.services.js";
import { getIO } from "../socket/socketServer.js";

eventBus.on("transactionCreated", async (transaction) => {
    try {
        const product = await Product.findById(transaction.productId);
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
                productId: product._id,
                currentStock: product.currentStock,
                requestedQuantity: transaction.quantity,
                type: transaction.type,
            });
            return;
        }

        product.currentStock = updatedStock;
        await product.save();

        eventBus.emit("inventoryUpdated", {
            transaction,
            product: product.toObject(),
            updatedStock,
        });

        console.log("Transaction event processed successfully", {
            transactionId: transaction._id,
            productId: product._id,
            updatedStock,
        });
    } catch (error) {
        console.error("transactionCreated handler failed:", error.message);
    }
});

eventBus.on("inventoryUpdated", async ({ transaction, product, updatedStock }) => {
    try {
        const isLowStock = updatedStock <= product.minimumStock;

        if (isLowStock) {
            const alertMessage = `${product.name} is low on stock`;
            const existingActiveAlert = await Alert.findOne({
                productId: product._id,
                type: "LOW_STOCK",
                status: "ACTIVE",
            });

            if (!existingActiveAlert) {
                await Alert.create({
                    productId: product._id,
                    message: alertMessage,
                    currentStock: updatedStock,
                    minimumStock: product.minimumStock,
                    status: "ACTIVE",
                });
            } else {
                existingActiveAlert.currentStock = updatedStock;
                existingActiveAlert.minimumStock = product.minimumStock;
                await existingActiveAlert.save();
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

        await Alert.updateMany(
            { productId: product._id, type: "LOW_STOCK", status: "ACTIVE" },
            {
                $set: {
                    status: "RESOLVED",
                    currentStock: updatedStock,
                    minimumStock: product.minimumStock,
                },
            }
        );
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
            productId: product._id,
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
    console.log(`WhatsApp Alert: ${message} for product ${product.name} (ID: ${product._id})`);
});
