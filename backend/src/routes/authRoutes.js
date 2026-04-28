const express = require("express");
const { register, login, getMe, logout, googleLogin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
