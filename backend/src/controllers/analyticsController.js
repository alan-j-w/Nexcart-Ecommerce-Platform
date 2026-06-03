const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// Helper to get ISO week number of a date
function getISOWeek(date) {
  const tempDate = new Date(date.valueOf());
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  return Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
}

// Helper to get the starting date of a week (Monday)
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday adjustment
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

// Initialize a continuous array of the last 12 weeks with zero values
function initializeLast12Weeks() {
  const weeks = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const start = getStartOfWeek(d);
    const year = start.getFullYear();
    const week = getISOWeek(start);
    weeks.push({
      year,
      week,
      label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: 0,
      orderCount: 0,
      commission: 0,
      unitsSold: 0
    });
  }
  return weeks;
}

// ── ADMIN ANALYTICS ──────────────────────────────────────────────────
exports.getAdminAnalytics = async (req, res) => {
  try {
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    // 1. Weekly Sales Curve & Order Volume (using $group, $match, $project, $sort)
    const rawWeeklyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveWeeksAgo },
          status: { $in: ["paid", "shipped", "delivered"] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          unitsSold: { $sum: { $sum: "$items.quantity" } }
        }
      },
      {
        $project: {
          year: "$_id.year",
          week: "$_id.week",
          revenue: 1,
          orderCount: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { year: 1, week: 1 } }
    ]);

    // Backfill empty weeks for a continuous weekly chart curve
    const weeklyData = initializeLast12Weeks();
    rawWeeklyStats.forEach(stat => {
      // Find week matching ISO standard (sometimes MongoDB $week index differs, so we align by matching week +/- 1 or exact)
      const weekIndex = weeklyData.findIndex(w => w.year === stat.year && Math.abs(w.week - stat.week) <= 1);
      if (weekIndex !== -1) {
        weeklyData[weekIndex].revenue += stat.revenue || 0;
        weeklyData[weekIndex].orderCount += stat.orderCount || 0;
        weeklyData[weekIndex].commission += (stat.revenue || 0) * 0.1;
        weeklyData[weekIndex].unitsSold += stat.unitsSold || 0;
      } else {
        // Fallback or append if outside range
        const matchedIndex = weeklyData.findIndex(w => w.week === stat.week);
        if (matchedIndex !== -1) {
          weeklyData[matchedIndex].revenue += stat.revenue || 0;
          weeklyData[matchedIndex].orderCount += stat.orderCount || 0;
          weeklyData[matchedIndex].commission += (stat.revenue || 0) * 0.1;
          weeklyData[matchedIndex].unitsSold += stat.unitsSold || 0;
        }
      }
    });

    // 2. Sales Category Breakdowns (using $match, $unwind, $lookup, $group, $project, $sort)
    const categoryStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "shipped", "delivered"] }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.category", "Uncategorized"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          category: "$_id",
          revenue: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 3. Top Performing Vendors (using $match, $unwind, $lookup, $group, $project, $sort, $limit)
    const vendorStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "shipped", "delivered"] }
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "users",
          localField: "items.vendor",
          foreignField: "_id",
          as: "vendor"
        }
      },
      { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$items.vendor",
          vendorName: { $first: { $ifNull: ["$vendor.name", "Deleted Vendor"] } },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          vendorId: "$_id",
          vendorName: 1,
          revenue: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // 4. General Stats / Summary Card Metrics
    const [totalProducts, totalVendors] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "vendor", isDeleted: { $ne: true } })
    ]);

    const totalOrders = weeklyData.reduce((acc, curr) => acc + curr.orderCount, 0);
    const totalGMV = weeklyData.reduce((acc, curr) => acc + curr.revenue, 0);
    const adminRevenue = totalGMV * 0.1;
    const averageOrderValue = totalOrders > 0 ? totalGMV / totalOrders : 0;

    res.json({
      summary: {
        totalGMV,
        adminRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts,
        totalVendors
      },
      weeklyData,
      categoryStats,
      vendorStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── VENDOR ANALYTICS ─────────────────────────────────────────────────
exports.getVendorAnalytics = async (req, res) => {
  try {
    const vendorObjectId = new mongoose.Types.ObjectId(req.user.id);
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);

    // 1. Weekly Sales Curve & Order Volume for vendor items (using $match, $unwind, $group, $project, $sort)
    const rawWeeklyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveWeeksAgo },
          status: { $in: ["paid", "shipped", "delivered"] },
          "items.vendor": vendorObjectId
        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.vendor": vendorObjectId
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity", 0.9] } }, // 90% goes to vendor
          commissionPaid: { $sum: { $multiply: ["$items.price", "$items.quantity", 0.1] } }, // 10% commission
          unitsSold: { $sum: "$items.quantity" },
          uniqueOrders: { $addToSet: "$_id" }
        }
      },
      {
        $project: {
          year: "$_id.year",
          week: "$_id.week",
          revenue: 1,
          commissionPaid: 1,
          unitsSold: 1,
          orderCount: { $size: "$uniqueOrders" },
          _id: 0
        }
      },
      { $sort: { year: 1, week: 1 } }
    ]);

    // Backfill empty weeks for vendor
    const weeklyData = initializeLast12Weeks();
    rawWeeklyStats.forEach(stat => {
      const weekIndex = weeklyData.findIndex(w => w.year === stat.year && Math.abs(w.week - stat.week) <= 1);
      if (weekIndex !== -1) {
        weeklyData[weekIndex].revenue += stat.revenue || 0;
        weeklyData[weekIndex].commission += stat.commissionPaid || 0;
        weeklyData[weekIndex].unitsSold += stat.unitsSold || 0;
        weeklyData[weekIndex].orderCount += stat.orderCount || 0;
      } else {
        const matchedIndex = weeklyData.findIndex(w => w.week === stat.week);
        if (matchedIndex !== -1) {
          weeklyData[matchedIndex].revenue += stat.revenue || 0;
          weeklyData[matchedIndex].commission += stat.commissionPaid || 0;
          weeklyData[matchedIndex].unitsSold += stat.unitsSold || 0;
          weeklyData[matchedIndex].orderCount += stat.orderCount || 0;
        }
      }
    });

    // 2. Sales Category Breakdowns for vendor's products
    const categoryStats = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "shipped", "delivered"] },
          "items.vendor": vendorObjectId
        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.vendor": vendorObjectId
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$product.category", "Uncategorized"] },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity", 0.9] } },
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          category: "$_id",
          revenue: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 3. Top Selling Products for this vendor
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ["paid", "shipped", "delivered"] },
          "items.vendor": vendorObjectId
        }
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.vendor": vendorObjectId
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$items.product",
          name: { $first: { $ifNull: ["$product.name", "Deleted Product"] } },
          image: { $first: { $arrayElemAt: [{ $ifNull: ["$product.images", []] }, 0] } },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity", 0.9] } },
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $project: {
          productId: "$_id",
          name: 1,
          image: 1,
          revenue: 1,
          unitsSold: 1,
          _id: 0
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // 4. General summary stats
    const totalProducts = await Product.countDocuments({ vendor: vendorObjectId });
    const totalEarnings = weeklyData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalCommissionPaid = weeklyData.reduce((acc, curr) => acc + curr.commission, 0);
    const totalOrders = weeklyData.reduce((acc, curr) => acc + curr.orderCount, 0);
    const totalUnitsSold = weeklyData.reduce((acc, curr) => acc + curr.unitsSold, 0);
    const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;

    res.json({
      summary: {
        totalEarnings,
        totalCommissionPaid,
        totalOrders,
        totalUnitsSold,
        totalProducts,
        averageOrderValue
      },
      weeklyData,
      categoryStats,
      topProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
