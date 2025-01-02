const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getDiscountItems = expressAsyncHandler(async (req, res) => {
  const SQL = "SELECT * FROM products WHERE discount > 0";

  db.query(SQL, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching discount items" });
    }

    return res.json(result);
  });
});

module.exports = getDiscountItems;
