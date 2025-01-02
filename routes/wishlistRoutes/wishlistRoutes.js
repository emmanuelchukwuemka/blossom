const express = require("express")
const router = express.Router()
const {upload} = require('../../middleware/Multer')

const { getAllWishlistItems, deleteWishlistItemByAdmin, deleteWishlistItem, addWishlistItemToCart, addAllWishlistToCart, createWishlistItem, updateWishlistItem } = require("../../controller/cartWishlistController/wishlist")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")
const { logMessage } = require('../../middleware/messagesMiddleware');




router.get("/wishlist/get-all/:userId", isAuthenticated, getAllWishlistItems);
router.delete("/wishlist/delete", isAuthenticated, deleteWishlistItemByAdmin);
router.post("/wishlist/user-delete", isAuthenticated, deleteWishlistItem);
router.post("/wishlist/add-wishlist-to-cart", isAuthenticated, logMessage("added wishlist item to cart"), addWishlistItemToCart);
router.post("/wishlist/add-all-to-cart", isAuthenticated, logMessage("added all wishlist to cart"), addAllWishlistToCart);
router.post("/wishlist/create-wishlist", isAuthenticated, logMessage("created wishlist item"), createWishlistItem);
router.patch("/wishlist/update-wishlist",  isAuthenticated, logMessage("updated wishlist item"), updateWishlistItem);

  
 module.exports = router;
