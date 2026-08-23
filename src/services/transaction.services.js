import eventBus from "../events/eventEmitter.js";
import Transaction from "../models/transaction.js";

class Transactionservices {
    async createTransaction(data) {
        const newTransaction = await Transaction.create({
            productId: data.productId,
            type: data.type,
            quantity: data.quantity,
            note: data.note,
        });

      eventBus.emit("transactionCreated", newTransaction);
      return newTransaction;
    }
}

export default new Transactionservices();