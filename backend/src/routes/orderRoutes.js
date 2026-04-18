const express = require("express");
const router = express.Router();

const { createOrder, getOrders, getVendorOrders, getVendorEarnings } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/vendor", protect, authorize("vendor"), getVendorOrders);
router.get("/vendor/earnings", protect, authorize("vendor"), getVendorEarnings);

module.exports = router;
