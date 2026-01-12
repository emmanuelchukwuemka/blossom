const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { logMessage } = require('../../middleware/messagesMiddleware');

const router = express.Router();

// Controllers
const {
  getSellerDashboard,
  getBuyerDashboard,
  listProduct,
  getSellerProducts,
  updateProduct,
  deleteProduct,
  getOrders,
  getSellerAnalytics,
  sendMessage,
  getMessages
} = require("../../controller/marketplaceController/marketplaceController");

// Seller Dashboard
router.get("/marketplace/seller-dashboard", isAuthenticated, logMessage("accessed seller dashboard"), getSellerDashboard);

// Buyer Dashboard
router.get("/marketplace/buyer-dashboard", isAuthenticated, logMessage("accessed buyer dashboard"), getBuyerDashboard);

// Product Management
router.post("/marketplace/list-product", isAuthenticated, logMessage("listed new product"), listProduct);
router.get("/marketplace/products", isAuthenticated, logMessage("viewed seller products"), getSellerProducts);
router.put("/marketplace/products/:id", isAuthenticated, logMessage("updated product"), updateProduct);
router.delete("/marketplace/products/:id", isAuthenticated, logMessage("deleted product"), deleteProduct);

// Order Management
router.get("/marketplace/orders", isAuthenticated, logMessage("viewed orders"), getOrders);

// Analytics
router.get("/marketplace/analytics", isAuthenticated, logMessage("viewed seller analytics"), getSellerAnalytics);

// Messaging
router.post("/marketplace/messages", isAuthenticated, logMessage("sent marketplace message"), sendMessage);
router.get("/marketplace/messages", isAuthenticated, logMessage("viewed marketplace messages"), getMessages);

module.exports = router;