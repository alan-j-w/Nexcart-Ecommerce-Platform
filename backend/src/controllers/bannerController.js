const Banner = require("../models/Banner");
const cloudinary = require("../config/cloudinary");

// Create a new banner (Admin only)
exports.createBanner = async (req, res) => {
  try {
    const { title, link, isActive, order, image } = req.body;

    let imageUrl = "";
    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "nexcart_banners",
      });
      imageUrl = uploadRes.secure_url;
    } else {
      return res.status(400).json({ error: "Image is required" });
    }

    const banner = await Banner.create({
      title,
      link,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      imageUrl,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all banners (Admin)
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get active banners (Public)
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a banner (Admin only)
exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    const { title, link, isActive, order, image } = req.body;

    if (title !== undefined) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "nexcart_banners",
      });
      banner.imageUrl = uploadRes.secure_url;
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a banner (Admin only)
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    await banner.deleteOne();
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
