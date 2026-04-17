const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;
    const orderItems = [];

    for (let item of cart.items) {
      const product = item.product;

      // 🔒 INVENTORY LOCK
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} out of stock`
        });
      }

      // Reduce stock immediately
      product.stock -= item.quantity;
      await product.save();

      total += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        vendor: product.vendor
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: total
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort("-createdAt");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
