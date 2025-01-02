const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getDevices = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user?.id;

  // Check if `user_id` is provided
  if (!userId) {
    return res.status(400).json({
      status: "fail",
      message: "User ID is required to fetch devices.",
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

    // Fetch devices
    const SQL = `SELECT * FROM devices WHERE user_id = ?`;
    db.query(SQL, [userId], (deviceErr, deviceResults) => {
      if (deviceErr) {
        console.error("Database error:", deviceErr);
        return res.status(500).json({
          status: "error",
          message: "Error fetching devices from the database.",
          error: deviceErr.message,
        });
      }

      if (deviceResults.length === 0) {
        return res.status(404).json({
          status: "fail",
          message: "No devices found for the provided user ID.",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Devices retrieved successfully.",
        devices: deviceResults,
      });
    });
  });
});

module.exports = getDevices;
