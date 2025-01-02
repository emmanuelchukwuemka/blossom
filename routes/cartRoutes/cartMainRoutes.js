const express = require("express")
const router = express.Router()
const {upload} = require('../../middleware/Multer')
const { getAllCartItems, deleteCartItem, deleteAllUserCarts, createCartItem, updateCartItem } = require("../../controller/cartWishlistController/cart")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")




router.get("/cart/get-all", isAuthenticated, getAllCartItems);
router.delete("/cart/delete-cart", isAuthenticated, deleteCartItem);
router.delete("/cart/delete-all", isAuthenticated, deleteAllUserCarts);
router.post("/cart/create-cart", isAuthenticated, createCartItem);
router.patch("/cart/update-cart", isAuthenticated, updateCartItem);

  
 module.exports = router;