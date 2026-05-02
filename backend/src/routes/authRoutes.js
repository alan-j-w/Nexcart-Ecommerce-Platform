const express = require("express");
const { register, login, getMe, logout, googleLogin, googleLoginCheck, googleCallback, forgotPassword, resetPassword } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google-login", googleLoginCheck); // Browser check
router.post("/google-login", googleLogin); // Actual auth
router.get("/google/callback", googleCallback); // Dummy callback
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);


module.exports = router;
