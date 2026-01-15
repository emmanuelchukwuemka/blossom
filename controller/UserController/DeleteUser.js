const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');


// Delete USERS
const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Validate the userId
  if (!userId) {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  const query = 'DELETE from Users WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Internal server error",
      });
    }

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found or already deleted",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  });
});

module.exports = deleteUser;
