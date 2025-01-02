const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const getRandomProducts = expressAsyncHandler(async (req, res) => {
  
  // Get the limit parameter from query or default to 30
  const limit = parseInt(req.params.limit, 10) || 30;

  // SQL query to get products with discount in random order and with a limit
  const SQL = `SELECT * FROM products WHERE discount > 0 ORDER BY RAND() LIMIT ?`;

  db.query(SQL, [limit], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching discount items" });
    }

    return res.json(result);
  });
});

module.exports = getRandomProducts;
