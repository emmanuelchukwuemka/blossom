const asyncHandler = require("express-async-handler");
const db = require('../Database/db');

// Middleware to log user actions, CAN ONLY BE USED FOR AUTHENTICATED ROUTES
const logMessage = (message) => {
  return asyncHandler(async (req, res, next) => {
    const { id } = req.user; // Assuming `isAuthenticated` middleware sets `req.user`

    const insertSQL = `
      INSERT INTO messages (sender_id, receiver_id, creator_id, message, date)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [id, id, id, message];

    db.query(insertSQL, values, (err, result) => {
      if (err) {
        console.error("Error logging user message:", err);
        return res.status(500).json({ message: "Error logging user action" });
      }
      next();
    });
  });
};

module.exports = { logMessage };
