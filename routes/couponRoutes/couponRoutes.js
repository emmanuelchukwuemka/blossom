const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../../controller/couponController/coupon");
const {
  getEligibleCoupons,
  applyCoupon,
  redeemCoupon,
} = require("../../controller/couponController/userCoupon");

const router = express.Router();

router.get("/coupons", isAuthenticated, getCoupons);
router.post("/coupons/create", isAuthenticated, createCoupon);
router.put("/coupons/edit", isAuthenticated, updateCoupon);
router.delete("/coupons/delete", isAuthenticated, deleteCoupon);

// user coupons
router.get("/user/coupons", isAuthenticated, getEligibleCoupons);
router.post("/user/coupons/apply", isAuthenticated, applyCoupon);
router.post("/user/coupons/redeem", isAuthenticated, redeemCoupon);

module.exports = router;
