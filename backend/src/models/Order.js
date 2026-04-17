const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
      vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ],

  totalAmount: Number,

  status: {
    type: String,
    enum: ["pending", "paid", "shipped", "delivered"],
    default: "pending"
  },

  paymentId: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
