const express = require("express");
const {
  approveVendor,
  getVendors,
  getPastVendors,
  toggleVendorActive,
  deleteVendor,
  getStats,
  getAllProducts,
  toggleProductActive,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { getLastEmail } = require("../services/mailService");


const router = express.Router();

// Vendor management
router.get("/vendors", protect, authorize("admin"), getVendors);
router.get("/vendors/past", protect, authorize("admin"), getPastVendors);
router.put("/approve-vendor/:id", protect, authorize("admin"), approveVendor);
router.put("/toggle-vendor-active/:id", protect, authorize("admin"), toggleVendorActive);
router.delete("/vendor/:id", protect, authorize("admin"), deleteVendor);

// Platform stats
router.get("/stats", protect, authorize("admin"), getStats);

// Products
router.get("/products", protect, authorize("admin"), getAllProducts);
router.put("/products/:id/toggle", protect, authorize("admin"), toggleProductActive);

// Orders
router.get("/orders", protect, authorize("admin"), getAllOrders);
router.put("/orders/:id/status", protect, authorize("admin"), updateOrderStatus);

// Dev only: Get last sent email
router.get("/dev/last-email", (req, res) => {
  res.json(getLastEmail());
});


module.exports = router;
