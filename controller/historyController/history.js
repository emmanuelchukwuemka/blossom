const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');
const { getOrCreateAppPreference } = require("../../utils/defaultTables");

// Toggle browsing history
const toggleHistory = asyncHandler(async (req, res) => {
  const { user_id, allow_history } = req.body;

  // Ensure the user has an app_preference entry
  await getOrCreateAppPreference(user_id);

  const SQL_UPDATE_PREFERENCE = `UPDATE app_preference SET allow_history = ? WHERE user_id = ?`;
  db.query(SQL_UPDATE_PREFERENCE, [allow_history, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update history preference", error: err.message });
    res.status(200).json({ message: `History tracking ${allow_history ? "enabled" : "disabled"}` });
  });
});

// Remove all browsing history for a user
const deleteAllHistory = asyncHandler(async (req, res) => {
  const user_id = req.params.userId || req.user.id;

  const SQL_DELETE_HISTORY = `DELETE FROM browse_history WHERE user_id = ?`;
  db.query(SQL_DELETE_HISTORY, [user_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete history",
        error: err.message,
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "No history items found to delete for this user",
      });
    }
    res.status(200).json({
      message: `${result.affectedRows} history item(s) deleted successfully`,
    });
  });
});



// Remove a single history item
const deleteSingleHistoryItem = asyncHandler(async (req, res) => {
  const history_id = req.params.historyId;

  const SQL_DELETE_SINGLE_HISTORY = `DELETE FROM browse_history WHERE id = ?`;
  db.query(SQL_DELETE_SINGLE_HISTORY, [history_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete history item",
        error: err.message,
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "History item not found or already deleted",
      });
    }
    res.status(200).json({
      message: "History item deleted successfully",
    });
  });
});


// Get all browsing history items for a user
const getAllHistoryItems = asyncHandler(async (req, res) => {
  const user_id = req.params.userId || req.user.id;

  const SQL_FETCH_HISTORY = `
    SELECT browse_history.*, products.title, products.price, products.images, products.rating, products.description, products.discount  
    FROM browse_history 
    JOIN products ON browse_history.product_id = products.id
    WHERE browse_history.user_id = ?
  `;
  db.query(SQL_FETCH_HISTORY, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to retrieve history", error: err.message });
    res.status(200).json({ historyItems: result });
  });
});

// Controller to log browsing history
const createHistory = asyncHandler(async (req, res) => {
  const { user_id, product_id } = req.body;

  // Ensure the user has an app_preference entry
  const appPreference = await getOrCreateAppPreference(user_id);

  const allow_history = appPreference.allow_history;
  if (!allow_history) {
    return res
      .status(200)
      .json({ message: "History tracking is disabled, please enable it to get history" });
  }
  const SQL_CHECK_EXISTING_HISTORY = `
    SELECT id FROM browse_history WHERE user_id = ? AND product_id = ?
  `;
  db.query(SQL_CHECK_EXISTING_HISTORY, [user_id, product_id], (err, existingHistory) => {
    if (err) {
      return res.status(500).json({
        message: "Error checking existing history",
        error: err.message,
      });
    }
    if (existingHistory.length > 0) {
      return res.status(200).json({ message: "Product already in history" });
    }
    const SQL_INSERT_HISTORY = `
      INSERT INTO browse_history (user_id, product_id, date)
      VALUES (?, ?, NOW())
    `;
    db.query(SQL_INSERT_HISTORY, [user_id, product_id], (err, insertResult) => {
      if (err) {
        return res.status(500).json({
          message: "Error logging history",
          error: err.message,
        });
      }
      const SQL_GET_NEW_HISTORY_WITH_PRODUCT = `
        SELECT bh.id as history_id, bh.date, bh.user_id, p.id as product_id, 
               p.title, p.price, p.images, p.rating, p.description, p.discount  
        FROM browse_history bh
        JOIN products p ON bh.product_id = p.id
        WHERE bh.id = ?
      `;
      db.query(SQL_GET_NEW_HISTORY_WITH_PRODUCT, [insertResult.insertId], (err, newHistoryWithProduct) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to retrieve new history item with product",
            error: err.message,
          });
        }
        res.status(200).json({
          message: "History item created successfully",
          newHistory: newHistoryWithProduct[0],
        });
      });
    });
  });
});


module.exports = { 
  toggleHistory,
  deleteAllHistory,
  deleteSingleHistoryItem,
  getAllHistoryItems,
  createHistory
};
