const User = require("../models/User");
const Product = require("../models/Product");

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.status(200).json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const productId = req.params.productId;

    const isFavorite = user.favorites.includes(productId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter((id) => id.toString() !== productId);
    } else {
      // Add to favorites
      user.favorites.push(productId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      isFavorite: !isFavorite,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
