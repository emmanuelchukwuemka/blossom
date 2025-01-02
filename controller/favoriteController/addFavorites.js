const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

const addFavoriteProduct = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const productId = req.body.product_id;

  const SQL =
    "INSERT INTO favorite_products (user_id, product_id) VALUES (?, ?)";
  db.query(SQL, [userId, productId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error adding favorite product" });
    }
    return res.json({ message: "Favorite product added successfully" });
  });
});

const addFavoriteSupplier = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const supplierId = req.body.supplier_id;

  const SQL =
    "INSERT INTO favorite_suppliers (user_id, supplier_id) VALUES (?, ?)";
  db.query(SQL, [userId, supplierId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error adding favorite supplier" });
    }
    return res.json({ message: "Favorite supplier added successfully" });
  });
});

const addFavoriteContent = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const contentId = req.body.content_id;

  const SQL =
    "INSERT INTO favorite_contents (user_id, content_id) VALUES (?, ?)";
  db.query(SQL, [userId, contentId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error adding favorite content" });
    }
    return res.json({ message: "Favorite content added successfully" });
  });
});

module.exports = {
  addFavoriteProduct,
  addFavoriteSupplier,
  addFavoriteContent,
};
