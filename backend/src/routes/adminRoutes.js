const express = require("express");
const { approveVendor, getVendors, getPastVendors, toggleVendorActive, deleteVendor } = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/vendors", protect, authorize("admin"), getVendors);
router.get("/vendors/past", protect, authorize("admin"), getPastVendors);
router.put("/approve-vendor/:id", protect, authorize("admin"), approveVendor);
router.put("/toggle-vendor-active/:id", protect, authorize("admin"), toggleVendorActive);
router.delete("/vendor/:id", protect, authorize("admin"), deleteVendor);

module.exports = router;
