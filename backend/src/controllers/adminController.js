const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ── Vendor management ──────────────────────────────────────────────────

// Get all active/pending vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", isDeleted: { $ne: true } }).select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get deleted vendors
exports.getPastVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", isDeleted: true }).select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve a vendor
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    vendor.isApproved = true;
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle active status
exports.toggleVendorActive = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    vendor.isActive = !vendor.isActive;
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete a vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    vendor.isDeleted = true;
    vendor.isActive = false;
    await vendor.save();
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Platform stats ─────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const [
      totalVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments({ role: "vendor", isDeleted: { $ne: true } }),
      User.countDocuments({ role: "vendor", isApproved: false, isDeleted: { $ne: true } }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.find().sort("-createdAt").limit(5).populate("user", "name email").populate("items.product", "name"),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const adminRevenue = totalRevenue * 0.1; // 10% commission

    res.json({
      totalVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      adminRevenue,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── All products (admin view) ──────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "name email")
      .sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle product active status
exports.toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.isActive = !product.isActive;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── All orders (admin view) ────────────────────────────────────────────

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name images")
      .populate("items.vendor", "name")
      .sort("-createdAt");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    const oldStatus = order.status;
    order.status = req.body.status;
    await order.save();

    // 🔔 REAL-TIME NOTIFICATION FOR CUSTOMER (ORDER SHIPPED)
    if (req.body.status === "shipped") {
      try {
        const notificationService = require("../services/notificationService");
        notificationService.sendNotification(
          order.user,
          "ORDER_SHIPPED",
          `Your order #${order._id.toString().slice(-6)} has been shipped!`,
          { orderId: order._id }
        );
      } catch (notifErr) {
        console.error("[Notification Event Error]:", notifErr);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
