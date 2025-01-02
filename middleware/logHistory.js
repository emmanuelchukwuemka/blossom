const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const db = require('../Database/db');
const ErrorResponse = require('../utils/errorResponse');



// Middleware to log browsing history
const logHistory = asyncHandler((req, res, next) => {
    const { user_id, product_id } = req.body;
  
    const SQL_CHECK_HISTORY = `SELECT allow_history FROM app_preference WHERE user_id = ?`;
    db.query(SQL_CHECK_HISTORY, [user_id], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to check history preference", error: err.message });
  
      const { allow_history } = result[0];
      if (!allow_history) return next();
  
      const SQL_INSERT_HISTORY = `INSERT INTO browse_history (user_id, product_id, date) VALUES (?, ?, NOW())`;
      db.query(SQL_INSERT_HISTORY, [user_id, product_id], (err) => {
        if (err) console.error("Error logging history:", err.message);
        next();
      });
    });
  });
  

  module.exports = {
    logHistory
  };