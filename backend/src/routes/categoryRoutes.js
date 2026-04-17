const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.route("/")
  .post(protect, authorize("admin"), createCategory)
  .get(getAllCategories);

router.route("/:id")
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
