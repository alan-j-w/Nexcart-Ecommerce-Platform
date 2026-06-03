const express = require("express");
const router = express.Router();
const { getAdminAnalytics, getVendorAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Admin Dashboard Analytics
router.get("/admin", protect, authorize("admin"), getAdminAnalytics);

// Vendor Dashboard Analytics
router.get("/vendor", protect, authorize("vendor"), getVendorAnalytics);

module.exports = router;
