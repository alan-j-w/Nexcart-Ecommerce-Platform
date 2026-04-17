const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,

  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  category: String,
  images: [String],

  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
