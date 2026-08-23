import mongoose from "mongoose";

export const connectDB = async () => {
  const mongodbUri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export const getDBState = () =>
  mongoose.connection.readyState === 1 ? "connected" : "disconnected";
