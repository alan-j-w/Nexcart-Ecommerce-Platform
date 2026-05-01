const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Trust proxy for rate limiting (Railway requirement)
app.set("trust proxy", 1);

// Middleware
app.use(helmet()); // Set secure HTTP headers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/auth", limiter); // Apply specifically to auth routes

// Restricted CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nexcart-ecommerce-platform.vercel.app" // Explicitly adding your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow if it's in our list OR if it's a Vercel preview/deployment URL
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.log("CORS Blocked Origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Health Route (Vital for Deployment)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP", message: "Nexcart API is healthy" });
});


// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/products", require("./src/routes/productRoutes"));
app.use("/api/cart", require("./src/routes/cartRoutes"));
app.use("/api/orders", require("./src/routes/orderRoutes"));
app.use("/api/payment", require("./src/routes/paymentRoutes"));
app.use("/api/banners", require("./src/routes/bannerRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));

app.get("/", (req, res) => {
  res.send("Multi-Vendor E-Commerce API running...");
});

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
