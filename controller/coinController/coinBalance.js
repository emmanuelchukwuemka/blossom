const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getCoinBalance = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const SQL = "SELECT coin_balance FROM wallet WHERE user_id = ?";
  db.query(SQL, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching wallet" });
    }

    return res.json(result[0]);
  });
});

module.exports = getCoinBalance;
