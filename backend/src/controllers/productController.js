const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// Helper: upload an array of base64 strings to Cloudinary
async function uploadImages(imageArray) {
  const urls = [];
  for (const b64 of imageArray) {
    if (!b64) continue;
    const uploadRes = await cloudinary.uploader.upload(b64, {
      folder: "nexcart_products",
    });
    urls.push(uploadRes.secure_url);
  }
  return urls;
}

// Update product (vendor only, must own product)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (product.vendor.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    const { name, description, price, stock, category, images: newImages } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;

    // newImages is an array of base64 strings or existing URLs
    // base64 strings start with "data:image/"; existing URLs start with "http"
    if (Array.isArray(newImages) && newImages.length > 0) {
      const base64Items = newImages.filter((img) => img.startsWith("data:image/"));
      const existingUrls = newImages.filter((img) => img.startsWith("http"));
      const uploaded = await uploadImages(base64Items);
      product.images = [...existingUrls, ...uploaded];
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
    // Accept either a single "image" (legacy) or "images" array
    let rawImages = [];
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      rawImages = req.body.images;
    } else if (req.body.image) {
      rawImages = [req.body.image];
    }

    const images = await uploadImages(rawImages);

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      images,
      vendor: req.user.id,
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
