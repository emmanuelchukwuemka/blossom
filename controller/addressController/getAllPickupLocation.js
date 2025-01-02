const asyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getAllPickupLocation = asyncHandler(async (req, res) => {
  const SQL = "SELECT * FROM pickup_locations";
  db.query(SQL, (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching pickup locations" });
    }
    return res.json(results);
  });
});

module.exports = getAllPickupLocation;
