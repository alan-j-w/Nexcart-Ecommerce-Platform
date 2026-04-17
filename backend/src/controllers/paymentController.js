const razorpay = require("../config/razorpay");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const crypto = require("crypto");

// Create Order (Razorpay)
exports.createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Filter out items where product was deleted/unavailable
    const validItems = cart.items.filter(item => item.product != null);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "All cart items are unavailable. Please refresh your cart." });
    }

    let total = 0;
    validItems.forEach(item => {
      total += (item.product.price || 0) * item.quantity;
    });

    if (total <= 0) {
      return res.status(400).json({ message: "Invalid cart total. Please refresh and try again." });
    }

    const options = {
      amount: Math.round(total * 100), // paise, must be an integer
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    console.log("[Payment] Creating Razorpay order:", options);
    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (err) {
    // Razorpay SDK errors are objects, not plain Error instances
    console.error("[Payment] Razorpay create-order error:", JSON.stringify(err, null, 2));
    const message = err?.error?.description || err?.message || "Failed to create payment order";
    res.status(500).json({ error: message });
  }
};

// Verify Payment & Final Order Fulfillment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 🔐 1. VERIFY SIGNATURE
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 🛒 2. GET USER CART
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    let total = 0;
    const orderItems = [];

    // 🔁 3. PROCESS EACH ITEM (Inventory & Pricing)
    for (let item of cart.items) {
      const product = item.product;

      if (!product) continue; // skip deleted products

      // ⚠️ STOCK CHECK
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      // 🔻 REDUCE STOCK
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

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No valid items to order" });
    }

    // 🧾 4. CREATE ORDER
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount: total,
      status: "paid",
      paymentId: razorpay_payment_id
    });

    // 🧹 5. CLEAR CART
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order created successfully",
      order
    });

  } catch (err) {
    console.error("[Payment] verifyPayment error:", err);
    res.status(500).json({ error: err.message });
  }
};
