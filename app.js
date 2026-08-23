import "dotenv/config";
import express from "express";
import http from "http";
import { connectDB, getDBState } from "./src/config/db.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import "./src/events/eventListner.js";
import { initSocket } from "./src/socket/socketServer.js";
import prisma from "./src/config/prisma.js";
import testPrisma from "./src/routes/testPrisma.js";

const app=express();
const server = http.createServer(app);
const PORT=process.env.PORT || 3000;

initSocket(server);

app.use(express.json());
app.use("/api", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/",(req,res)=>{
    res.send("Hello World");
})

// const test = async () => {
//   const products = await prisma.product.findMany();
//   console.log(products);
// };
// test();
app.use("/test-prisma", testPrisma);
app.get("/health", (req, res) => {
    res.json({ status: "ok", database: getDBState() });
});

connectDB().then(() => {
    server.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    })
});