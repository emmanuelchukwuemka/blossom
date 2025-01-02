const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const applyGiftCard = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const { code } = req.body;

  if (!code) {
      return res.status(400).json({ message: "Code is required" });
  }

  // Check if the user exists
  const checkUserSQL = "SELECT id FROM users WHERE id = ?";
  db.query(checkUserSQL, [userId], (err, userResults) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error checking user in database" });
      }

      if (userResults.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      // Proceed to check if the gift card exists
      const checkGiftCardSQL = "SELECT * FROM GiftCards WHERE card_code = ?";
      db.query(checkGiftCardSQL, [code], (err, giftcard) => {
          if (err) {
              console.log(err);
              return res
                  .status(500)
                  .json({ message: "Error fetching gift card from database" });
          }

          if (giftcard.length === 0) {
              return res.status(404).json({ message: "Gift card not found" });
          }

          // Check if gift card is enabled
          if (giftcard[0].enabled === 0) {
              return res.status(201).json({ message: "Gift card has been used" });
          }

          // Set gift card enable to 0 and associate with user_id
          const updateGiftCardSQL =
              "UPDATE GiftCards SET enabled = 0, user_id = ? WHERE card_code = ?";
          db.query(updateGiftCardSQL, [userId, code], (err) => {
              if (err) {
                  console.log(err);
                  return res
                      .status(500)
                      .json({ message: "Error updating gift card in database" });
              }

              // Add to user wallet
              const addWalletSQL =
                  "UPDATE wallet SET giftcard_balance = giftcard_balance + ? WHERE user_id = ?";
              db.query(addWalletSQL, [giftcard[0].price, userId], (err) => {
                  if (err) {
                      console.log(err);
                      return res
                          .status(500)
                          .json({ message: "Error updating wallet in database" });
                  }

                  // Create history
                  const createHistorySQL =
                      "INSERT INTO giftcard_histories (user_id, giftcard_id, amount, method, claimed_at) VALUES (?, ?, ?, ?, ?)";
                  db.query(
                      createHistorySQL,
                      [userId, giftcard[0].id, giftcard[0].price, "apply_code", new Date()],
                      (err) => {
                          if (err) {
                              console.log(err);
                              return res
                                  .status(500)
                                  .json({ message: "Error creating history in database" });
                          }

                          return res.json({ message: "Gift card applied successfully" });
                      }
                  );
              });
          });
      });
  });
});


module.exports = applyGiftCard;
