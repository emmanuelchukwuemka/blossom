const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getAllContents = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user?.id;

  // Check if `user_id` is provided
  if (!userId) {
    return res.status(400).json({
      status: "fail",
      message: "User ID is required to fetch contents.",
    });
  }

  // Verify if the user exists
  const userCheckSQL = `SELECT id FROM users WHERE id = ?`;
  db.query(userCheckSQL, [userId], (err, userResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        status: "error",
        message: "Error checking user existence.",
        error: err.message,
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    // Fetch contents
    const SQL = "SELECT * FROM contents WHERE user_id = ?";
    db.query(SQL, [userId], (contentErr, contentResults) => {
      if (contentErr) {
        console.error("Database error:", contentErr);
        return res.status(500).json({
          status: "error",
          message: "Error fetching contents from the database.",
          error: contentErr.message,
        });
      }

      if (contentResults.length === 0) {
        return res.status(404).json({
          status: "fail",
          message: "No contents found for the provided user ID.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Contents retrieved successfully.",
        contents: contentResults,
      });
    });
  });
});

module.exports = getAllContents;
