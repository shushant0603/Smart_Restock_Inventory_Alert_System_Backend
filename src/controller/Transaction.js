 import transaction from "../services/transaction.services.js";
 const createTransaction = async (req, res) => {
    try {
        const payload = { ...req.body, userId: req.user.id };
        const createtransaction= await transaction.createTransaction(payload);
        res.status(201).json(
            {
                message:'order created successfully',
                data:createtransaction
            }
        );
    } catch (error) {
    console.error("Error in Transaction.js:", error);
        const statusCode = error.statusCode || (error.name === "ValidationError" ? 400 : 500);
        res.status(statusCode).json(
            {
                message:'failed to create order',
                error:error.message
            }
        );
    }
 };

 export { createTransaction };
 export default createTransaction;
     