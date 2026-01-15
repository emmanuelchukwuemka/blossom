const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const garageDelivery = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user?.id;
  const { zipCode } = req.body;

  // Check if the zip code is provided
  if (!zipCode) {
    return res.status(400).json({ message: "Zip Code is required" });
  }

  // Verify if the user exists
  const userCheckSQL = `SELECT id from Users WHERE id = ?`;
  db.query(userCheckSQL, [userId], (userErr, userResults) => {
    if (userErr) {
      console.error("Database error:", userErr);
      return res.status(500).json({
        message: "Error verifying user existence.",
        error: userErr.message,
      });
    }

    if (userResults.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the zip code already exists in garage deliveries
    const checkZipSQL = "SELECT * FROM garage_deliveries WHERE zip_code = ?";
    db.query(checkZipSQL, [zipCode], (zipErr, zipResults) => {
      if (zipErr) {
        console.error("Database error:", zipErr);
        return res
          .status(500)
          .json({ message: "Error checking if garage delivery exists" });
      }

      if (zipResults.length > 0) {
        return res
          .status(400)
          .json({ message: "Garage delivery already exists" });
      }

      // Insert the garage delivery
      const insertSQL =
        "INSERT INTO garage_deliveries(user_id, zip_code) VALUES (?, ?)";
      db.query(insertSQL, [userId, zipCode], (insertErr, insertResults) => {
        if (insertErr) {
          console.error("Database error:", insertErr);
          return res
            .status(500)
            .json({ message: "Error inserting into garage_deliveries" });
        }

        return res.status(200).json({ message: "Saved Successfully" });
      });
    });
  });
});

module.exports = garageDelivery;
