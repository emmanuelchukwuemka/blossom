const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const getWallet = require("../../controller/walletController/getWallet");
const addCheckingAccount = require("../../controller/walletController/addCheckingAccount");
const {
  verifyWallet,
  verifyWalletOtp,
} = require("../../controller/walletController/verifyWallet");

const router = express.Router();

router.get("/user/wallet/:userId", isAuthenticated, getWallet);
router.post(
  "/user/wallet/add-checking-acc",
  isAuthenticated,
  addCheckingAccount
);

// wallet verification
router.post("/wallet/verify", isAuthenticated, verifyWallet);
router.post("/wallet/verify-otp", isAuthenticated, verifyWalletOtp);

module.exports = router;
