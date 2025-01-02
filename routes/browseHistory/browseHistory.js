const express = require("express");
const router = express.Router()
const { toggleHistory, deleteAllHistory, deleteSingleHistoryItem, getAllHistoryItems, createHistory, } = require('../../controller/historyController/history')
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")
const { logHistory } =  require("../../middleware/logHistory") // use this middleware for routes where you want to log the history, it takes in the user_id and product_id in the request body




  router.post("/browsehistory/toggle-history", isAuthenticated, toggleHistory);
  router.delete("/browsehistory/delete-all-history/:userId", isAuthenticated, deleteAllHistory);
  router.delete("/browsehistory/delete-single-history/:historyId", isAuthenticated, deleteSingleHistoryItem);
  router.get("/browsehistory/get-history/:userId", isAuthenticated, getAllHistoryItems);
  router.post("/browsehistory/create-history", isAuthenticated, createHistory);

 

  module.exports = router;