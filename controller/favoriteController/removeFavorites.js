const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const removeFavoriteProduct = expressAsyncHandler(async (req, res) => {
  const { user_id, product_id } = req.body;

  const SQL =
    "DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?";
  db.query(SQL, [user_id, product_id], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error removing favorite product" });
    }
    return res.json({ message: "Favorite product removed successfully" });
  });
});

const removeFavoriteSupplier = expressAsyncHandler(async (req, res) => {
  const { user_id, supplier_id } = req.body;

  const SQL =
    "DELETE FROM favorite_suppliers WHERE user_id = ? AND supplier_id = ?";
  db.query(SQL, [user_id, supplier_id], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error removing favorite supplier" });
    }
    return res.json({ message: "Favorite supplier removed successfully" });
  });
});

const removeFavoriteContent = expressAsyncHandler(async (req, res) => {
  const { user_id, content_id } = req.body;

  const SQL =
    "DELETE FROM favorite_contents WHERE user_id = ? AND content_id = ?";
  db.query(SQL, [user_id, content_id], (err, results) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error removing favorite content" });
    }
    return res.json({ message: "Favorite content removed successfully" });
  });
});

module.exports = {
  removeFavoriteProduct,
  removeFavoriteSupplier,
  removeFavoriteContent,
};
