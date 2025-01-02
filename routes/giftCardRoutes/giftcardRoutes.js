const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const getGiftCardBalance = require("../../controller/giftcardController/getGiftCardBalance");
const applyGiftCard = require("../../controller/giftcardController/applyGiftCard");
const getAllGiftCards = require("../../controller/giftcardController/getAllGiftCards");
const reloadGiftCardBalamce = require("../../controller/giftcardController/reloadGiftCardBalamce");
const {
  buyGiftCardNow,
  addGiftCardToCart,
  createPersonaliseGiftcard,
} = require("../../controller/giftcardController/buyGiftCard");
const { upload } = require("../../middleware/Multer");

const router = express.Router();

router.get("/manage/giftcard/all", isAuthenticated, getAllGiftCards);
router.get("/manage/giftcard/balance/:userId", isAuthenticated, getGiftCardBalance);
router.post("/manage/giftcard/apply", isAuthenticated, applyGiftCard);
router.post("/manage/giftcard/reload", isAuthenticated, reloadGiftCardBalamce);
router.post("/manage/giftcard/buy-now", isAuthenticated, buyGiftCardNow);
router.post("/manage/giftcard/cart", isAuthenticated, addGiftCardToCart);

router.post(
  "/manage/giftcard/create-personalise",
  isAuthenticated,
  upload.single("file"),
  createPersonaliseGiftcard
);

module.exports = router;
