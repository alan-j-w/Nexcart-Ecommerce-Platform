const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getVendorProducts,
  updateProduct
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("vendor"), createProduct);
router.get("/", getProducts);
router.get("/vendor", protect, authorize("vendor"), getVendorProducts);
router.put("/:id", protect, authorize("vendor"), updateProduct);

module.exports = router;
