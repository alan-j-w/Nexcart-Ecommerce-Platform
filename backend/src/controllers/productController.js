const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Update product (vendor only, must own product)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.vendor.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    const { name, description, price, stock, category, image } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;

    // If a new image (base64) was provided, upload it to Cloudinary
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "nexcart_products",
      });
      product.images = [uploadRes.secure_url];
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add product
exports.createProduct = async (req, res) => {
  try {
    let images = [];
    if (req.body.image) {
      const uploadRes = await cloudinary.uploader.upload(req.body.image, {
        folder: "nexcart_products"
      });
      images.push(uploadRes.secure_url);
    }

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      images: images,
      vendor: req.user.id
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products (public)
exports.getProducts = async (req, res) => {
  try {
    const User = require("../models/User");
    // Only hide products from suspended or deleted vendors
    const activeVendors = await User.find({ 
      role: "vendor", 
      isActive: { $ne: false },
      isDeleted: { $ne: true } 
    }).select("_id");
    
    const activeVendorIds = activeVendors.map(v => v._id);
    
    const products = await Product.find({ vendor: { $in: activeVendorIds } }).populate("vendor", "name");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vendor products
exports.getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
