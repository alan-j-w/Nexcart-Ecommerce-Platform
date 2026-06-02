const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const notificationService = require("../services/notificationService");

router.get("/subscribe", (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No subscription token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Prevent proxy buffering
    res.flushHeaders();

    // Register active client connection
    notificationService.addClient(userId, res);

    // Immediately send a confirmation handshake event
    const handshakePayload = JSON.stringify({
      type: "SYSTEM_HANDSHAKE",
      message: "Connected to Nexcart Real-time Event Hub",
      timestamp: new Date()
    });
    res.write(`data: ${handshakePayload}\n\n`);

    // Setup keep-alive ping loop every 20 seconds to prevent connection drops on platforms like Render or Vercel
    const keepAliveInterval = setInterval(() => {
      res.write(":\n\n"); // Standard SSE comment as heartbeat
    }, 20000);

    // Cleanup on client connection close
    req.on("close", () => {
      clearInterval(keepAliveInterval);
      notificationService.removeClient(userId, res);
    });

  } catch (err) {
    console.error("[Notifications Router] Verification failed:", err.message);
    res.status(401).json({ message: "Invalid or expired session token." });
  }
});

module.exports = router;
