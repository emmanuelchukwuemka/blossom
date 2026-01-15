const db = require("../../Database/db");
const asyncHandler = require("express-async-handler");

const addAddress = asyncHandler(async (req, res) => {
  const {
    country,
    name,
    code,
    phone,
    address,
    address2,
    city,
    state,
    postalCode,
    isDefault,
  } = req.body;
  const userId = req.body.user_id || req.user.id;

  // Step 1: Check if the user exists
  const checkUserSQL = `SELECT id from Users WHERE id = ?`;
  db.query(checkUserSQL, [userId], (err, userResult) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error occurred" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: If isDefault is true, unset other default addresses for this user
    if (isDefault) {
      const unsetDefaultSQL = `UPDATE addresses SET set_default = 0 WHERE user_id = ?`;
      db.query(unsetDefaultSQL, [userId], (unsetErr) => {
        if (unsetErr) {
          console.error(unsetErr);
          return res.status(500).json({ message: "Failed to unset previous default address" });
        }

        // Proceed to insert the new address
        insertAddress();
      });
    } else {
      // If isDefault is false, directly insert the address
      insertAddress();
    }
  });

  // Helper function to insert the address
  const insertAddress = () => {
    const insertAddressSQL = `
      INSERT INTO addresses 
      (country, name, code, phone, address, address2, city, state, postal_code, set_default, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      country,
      name,
      code,
      phone,
      address,
      address2,
      city,
      state,
      postalCode,
      isDefault,
      userId,
    ];

    db.query(insertAddressSQL, params, (insertErr, result) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ message: "Failed to add address" });
      }

      return res.status(200).json({ message: "Address added successfully" });
    });
  };
});

module.exports = addAddress;
