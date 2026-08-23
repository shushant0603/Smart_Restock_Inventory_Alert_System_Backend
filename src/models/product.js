import mongoose from "mongoose";
// Your project is basically managing one thing: stock.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    minimumStock: {
      type: Number,
      required: true,
      min: 0,
    },

    reorderQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    supplier: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;