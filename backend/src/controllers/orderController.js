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

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} out of stock` });
      }

      product.stock -= item.quantity;
      await product.save();

      total += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        vendor: product.vendor,
      });
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: total,
    });

    cart.items = [];
    await cart.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer orders
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

// Vendor orders — items where vendor matches this vendor
exports.getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ "items.vendor": req.user.id })
      .populate("user", "name email")
      .populate("items.product", "name images price")
      .sort("-createdAt");

    // Filter items to only show this vendor's items
    const filtered = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      createdAt: order.createdAt,
      user: order.user,
      paymentId: order.paymentId,
      items: order.items.filter(
        (item) => item.vendor?.toString() === req.user.id
      ),
      vendorTotal: order.items
        .filter((item) => item.vendor?.toString() === req.user.id)
        .reduce((sum, item) => sum + item.price * item.quantity, 0),
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vendor earnings summary
exports.getVendorEarnings = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.vendor": req.user.id,
      status: { $in: ["paid", "shipped", "delivered"] },
    }).populate("items.product", "name images price");

    let totalEarnings = 0;
    let totalOrders = 0;
    const byProduct = {};

    for (const order of orders) {
      const vendorItems = order.items.filter(
        (i) => i.vendor?.toString() === req.user.id
      );
      if (vendorItems.length === 0) continue;
      totalOrders++;
      for (const item of vendorItems) {
        const amount = item.price * item.quantity;
        totalEarnings += amount;
        const pid = item.product?._id?.toString();
        if (pid) {
          if (!byProduct[pid]) {
            byProduct[pid] = {
              name: item.product?.name || "Unknown",
              image: item.product?.images?.[0] || "",
              revenue: 0,
              unitsSold: 0,
            };
          }
          byProduct[pid].revenue += amount;
          byProduct[pid].unitsSold += item.quantity;
        }
      }
    }

    res.json({
      totalEarnings,
      totalOrders,
      topProducts: Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
