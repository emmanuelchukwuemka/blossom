const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const getCoinBalance = require("../../controller/coinController/coinBalance");
const getDiscountItems = require("../../controller/coinController/discountItems");
const {
  getAllCheckinRewards,
  checkinClaimReward,
  checkinHistory,
} = require("../../controller/coinController/dailyCheckin");
const { logMessage } = require('../../middleware/messagesMiddleware');

const router = express.Router();

router.get("/coin/balance", isAuthenticated, getCoinBalance);
router.get("/coin/discount-items", isAuthenticated, getDiscountItems);
router.post("/coin/history", isAuthenticated, checkinHistory);

router.get("/coin/checkin/rewards/:userId", isAuthenticated, getAllCheckinRewards);
router.post("/coin/checkin/claim", isAuthenticated, logMessage("claim check in reward"), checkinClaimReward);

module.exports = router;
