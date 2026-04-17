const User = require("../models/User");

// Get all active/pending vendors
exports.getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", isDeleted: { $ne: true } }).select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get deleted vendors
exports.getPastVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor", isDeleted: true }).select("-password");
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve a vendor
exports.approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.isApproved = true;
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle active status
exports.toggleVendorActive = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.isActive = !vendor.isActive;
    await vendor.save();
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete a vendor
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.isDeleted = true;
    vendor.isActive = false; // also mark inactive
    await vendor.save();
    res.json({ message: "Vendor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
