import eventBus from "../events/eventEmitter.js";
import prisma from "../config/prisma.js";

class Transactionservices {
    async createTransaction(data) {
        const newTransaction = await prisma.transaction.create({
            data: {
                productId: parseInt(data.productId),
                type: data.type.toUpperCase(),
                quantity: parseInt(data.quantity),
                note: data.note,
                userId: data.userId,
            }
        });

      eventBus.emit("transactionCreated", newTransaction);
      return newTransaction;
    }
}

export default new Transactionservices();