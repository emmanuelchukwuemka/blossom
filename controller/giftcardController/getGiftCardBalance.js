const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { getOrCreateWallet } = require("../../utils/defaultTables");

const getGiftCardBalance = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user.id;
  
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  await getOrCreateWallet(userId);

  const SQL = "SELECT giftcard_balance FROM wallet WHERE user_id = ?";
  db.query(SQL, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching giftcard wallet" });
    }

    return res.json(result[0]);
  });
});

module.exports = getGiftCardBalance;
