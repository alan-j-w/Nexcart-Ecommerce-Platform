const clients = new Map(); // Map of userId (string) -> Array of Response objects

/**
 * Register a new SSE client connection for a user
 */
exports.addClient = (userId, res) => {
  const key = userId.toString();
  if (!clients.has(key)) {
    clients.set(key, []);
  }
  clients.get(key).push(res);
  console.log(`[NotificationService] Connected client for user: ${key}. Active streams: ${clients.get(key).length}`);
};

/**
 * Remove an active SSE connection
 */
exports.removeClient = (userId, res) => {
  const key = userId.toString();
  if (!clients.has(key)) return;
  const userConnections = clients.get(key);
  const index = userConnections.indexOf(res);
  if (index !== -1) {
    userConnections.splice(index, 1);
    console.log(`[NotificationService] Disconnected client for user: ${key}. Active streams remaining: ${userConnections.length}`);
  }
  if (userConnections.length === 0) {
    clients.delete(key);
  }
};

/**
 * Dispatch a real-time event to a user if they are online
 */
exports.sendNotification = (userId, type, message, data = {}) => {
  const key = userId.toString();
  if (clients.has(key)) {
    const payload = JSON.stringify({ type, message, data, timestamp: new Date() });
    clients.get(key).forEach((res) => {
      res.write(`data: ${payload}\n\n`);
    });
    console.log(`[NotificationService] Broadcasted SSE to user ${key}: ${type}`);
    return true;
  }
  console.log(`[NotificationService] User ${key} is currently offline. Notification skipped.`);
  return false;
};
