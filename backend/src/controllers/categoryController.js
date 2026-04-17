const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

// Create a new category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image } = req.body;

    let imageUrl = "";
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "categories",
      });
      imageUrl = uploadRes.secure_url;
    } else {
      return res.status(400).json({ error: "Image is required" });
    }

    const category = await Category.create({
      name,
      slug,
      imageUrl,
    });

    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category name or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get all categories (Public)
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a category (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const { name, slug, image } = req.body;

    if (name !== undefined) category.name = name;
    if (slug !== undefined) category.slug = slug;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "categories",
      });
      category.imageUrl = uploadRes.secure_url;
    }

    await category.save();
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Category name or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete a category (Admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
