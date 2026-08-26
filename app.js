import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import "./src/events/eventListner.js";
import { initSocket } from "./src/socket/socketServer.js";
import prisma from "./src/config/prisma.js";
import testPrisma from "./src/routes/testPrisma.js";

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(",") 
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
const PORT = process.env.PORT || 3000;

initSocket(server);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", inventoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/suppliers", supplierRoutes);

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
    res.json({ status: "ok", database: "connected (prisma)" });
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})