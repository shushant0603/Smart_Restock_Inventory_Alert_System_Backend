import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    // primary key 
    //user id, receipient id
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      type: String,
      enum: ["LOW_STOCK"],
      required: true,
      default: "LOW_STOCK",
    },

    message: {
      type: String,
      required: true,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;