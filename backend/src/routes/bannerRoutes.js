const express = require("express");
const router = express.Router();
const {
  createBanner,
  getAllBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
} = require("../controllers/bannerController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/active", getActiveBanners);

// Admin routes
router.get("/", protect, authorize("admin"), getAllBanners);
router.post("/", protect, authorize("admin"), createBanner);
router.put("/:id", protect, authorize("admin"), updateBanner);
router.delete("/:id", protect, authorize("admin"), deleteBanner);

module.exports = router;
