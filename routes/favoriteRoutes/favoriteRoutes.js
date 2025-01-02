const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const {
  favoriteProducts,
  favoriteSuppliers,
  favoriteContents,
} = require("../../controller/favoriteController/getFavorites");
const {
  addFavoriteProduct,
  addFavoriteSupplier,
  addFavoriteContent,
} = require("../../controller/favoriteController/addFavorites");
const {
  removeFavoriteProduct,
  removeFavoriteSupplier,
  removeFavoriteContent,
} = require("../../controller/favoriteController/removeFavorites");

const router = express.Router();

router.get("/favorites/products", isAuthenticated, favoriteProducts);
router.get("/favorites/suppliers", isAuthenticated, favoriteSuppliers);
router.get("/favorites/contents", isAuthenticated, favoriteContents);

// routes to set favorites
router.post("/favorites/products", isAuthenticated, addFavoriteProduct);
router.post("/favorites/suppliers", isAuthenticated, addFavoriteSupplier);
router.post("/favorites/contents", isAuthenticated, addFavoriteContent);

// routes to remove favorites
router.delete("/favorites/products", isAuthenticated, removeFavoriteProduct);
router.delete("/favorites/suppliers", isAuthenticated, removeFavoriteSupplier);
router.delete("/favorites/contents", isAuthenticated, removeFavoriteContent);

module.exports = router;
