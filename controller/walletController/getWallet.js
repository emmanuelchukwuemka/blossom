const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { getOrCreateWallet } = require("../../utils/defaultTables");

const getWallet = expressAsyncHandler(async (req, res) => {
  const userId =  req.params.userId || req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const ensureUserHasWallet = await getOrCreateWallet(userId);

  const SQL = "SELECT * FROM wallet WHERE user_id = ?";
  db.query(SQL, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching wallet" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    return res.status(200).json({ wallet: result[0] });
  });
});

module.exports = getWallet;
