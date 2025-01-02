const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const addUserPickupLocation = expressAsyncHandler(async (req, res) => {
  const { pickupLocationId } = req.body;
  const userId = req.body.user_id || req.user.id;

  // Step 1: Verify that the pickupLocationId exists in the pickup_locations table
  const VERIFY_LOCATION_SQL = "SELECT * FROM pickup_locations WHERE id = ?";
  db.query(VERIFY_LOCATION_SQL, [pickupLocationId], (err, locationResults) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Something went wrong" });
    }

    if (locationResults.length === 0) {
      // Pickup location does not exist
      return res.status(400).json({
        message: "Invalid pickup location ID",
      });
    }

    // Step 2: Check if the pickup location already exists for the user
    const CHECK_USER_PICKUP_SQL =
      "SELECT * FROM user_pickup_locations WHERE user_id = ? AND pickup_location_id = ?";
    db.query(
      CHECK_USER_PICKUP_SQL,
      [userId, pickupLocationId],
      (err, userPickupResults) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Something went wrong" });
        }

        if (userPickupResults.length > 0) {
          // Pickup location already exists for the user
          return res.status(400).json({
            message: "Pickup location already exists for the user",
          });
        }

        // Step 3: Insert the new pickup location for the user
        const ADD_PICKUP_SQL =
          "INSERT INTO user_pickup_locations(user_id, pickup_location_id) VALUES(?,?)";
        db.query(
          ADD_PICKUP_SQL,
          [userId, pickupLocationId],
          (err, insertResults) => {
            if (err) {
              console.log(err);
              return res
                .status(500)
                .json({ message: "Something went wrong" });
            }

            return res
              .status(200)
              .json({ message: "Pickup location added successfully" });
          }
        );
      }
    );
  });
});

module.exports = addUserPickupLocation;
