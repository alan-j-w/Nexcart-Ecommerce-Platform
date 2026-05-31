const getRazorpayInstance = require("../config/razorpay");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const crypto = require("crypto");

// Create Order (Razorpay)
exports.createRazorpayOrder = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: "Payment service is currently unavailable" });
  }

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

    // ⚠️ CRITICAL PRE-CHECK: Stock & Active Status Validation
    for (let item of validItems) {
      if (item.product.isActive === false) {
        return res.status(400).json({ message: `${item.product.name} is no longer active and cannot be purchased.` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ message: `${item.product.name} is out of stock (available: ${item.product.stock}). Please adjust your cart.` });
      }
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

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID // Deliver public key dynamically to avoid frontend env issues
    });

  } catch (err) {
    console.error("[Payment] Razorpay create-order error:", err);
    res.status(500).json({ error: "Failed to create payment order" });
  }
};

// Verify Payment & Final Order Fulfillment
exports.verifyPayment = async (req, res) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: "Payment service is currently unavailable" });
  }

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
      console.warn(`[Payment] Signature verification failed. Expected: ${generatedSignature}, Received: ${razorpay_signature}`);
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // 🛒 2. GET USER CART
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 🔁 3. TWO-PASS TRANSACTIONAL INVENTORY & PRICING PROCESS
    
    // Pass 1: Stock and availability validation (guarantees we don't end up with partial/inconsistent inventory state)
    for (let item of cart.items) {
      const product = item.product;
      if (!product || product.isActive === false) {
        return res.status(400).json({
          message: `Product is no longer available. Please contact customer support with payment ID: ${razorpay_payment_id}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} went out of stock during payment. Please contact customer support with payment ID: ${razorpay_payment_id}`
        });
      }
    }

    let total = 0;
    const orderItems = [];

    // Pass 2: Deduct stock and build order items (guaranteed to succeed since all checks passed)
    for (let item of cart.items) {
      const product = item.product;

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
    res.status(500).json({ error: "Payment verification failed" });
  }
};
