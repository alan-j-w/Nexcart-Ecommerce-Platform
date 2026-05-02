const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetPasswordEmail } = require("../services/mailService");



// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: true // auto-approve; admin can suspend/delete via dashboard
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Google Login POST handler (called by frontend)
exports.googleLogin = async (req, res) => {
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  try {
    const { idToken, credential } = req.body;
    const tokenToVerify = idToken || credential;

    if (!tokenToVerify) {
      return res.status(400).json({ error: "Token is required (idToken or credential)" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error("GOOGLE_CLIENT_ID is missing in environment variables");
      return res.status(500).json({ error: "Server configuration error: missing Google Client ID" });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: tokenToVerify,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error("Google Token Verification Failed:", verifyError.message);
      return res.status(400).json({ error: "Invalid Google token: " + verifyError.message });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token payload" });
    }

    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random password for social login
        role: "customer",
        isApproved: true,
      });
      console.log(`New user created via Google Login: ${email}`);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google Login Controller Error:", err);
    res.status(500).json({ error: "Internal server error during Google login" });
  }
};

// Google Login GET handler (for testing/browser check)
exports.googleLoginCheck = (req, res) => {
  res.json({ 
    status: "Ready", 
    message: "Google Login endpoint is active. Use POST to submit tokens.",
    clientIdSet: !!process.env.GOOGLE_CLIENT_ID
  });
};

// Google Callback handler (placeholder for redirect flow)
exports.googleCallback = (req, res) => {
  res.send("Google callback received. If you see this, you might be using the redirect flow instead of the popup flow. Please check your frontend configuration.");
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.isDeleted) {
      return res.status(403).json({ message: "Your account has been deleted" });
    }

    if (user.role === "vendor") {
      if (user.isActive === false) {
        return res.status(403).json({ message: "Your vendor account is temporarily suspended. Please contact support." });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Current User (Session Sync)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email" });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    try {
      await sendResetPasswordEmail(user.email, resetUrl);
      res.json({ message: "Email sent with reset instructions" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: "Email could not be sent. Please try again later." });
    }
  } catch (err) {

    res.status(500).json({ error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

