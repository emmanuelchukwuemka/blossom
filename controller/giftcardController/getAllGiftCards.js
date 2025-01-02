const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getAllEnabledGiftCards = expressAsyncHandler(async (req, res) => {
  const SQL = "SELECT * FROM GiftCards WHERE enabled = 1";

  db.query(SQL, (err, result) => {
    if (err) {
      console.error("Error fetching gift cards:", err);
      return res.status(500).json({ message: "Error fetching gift cards" });
    }

    return res.json(result);
  });
});

module.exports = getAllEnabledGiftCards;
