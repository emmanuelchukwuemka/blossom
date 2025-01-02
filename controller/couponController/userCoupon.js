const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { checkCouponEligibility } = require("../../utils/couponUtils");

// Retrieve eligible coupons for the user
const getEligibleCoupons = expressAsyncHandler((req, res) => {
  const userId = req.body.user_id || req.user.id;
  const { type } = req.body;

  // Base SQL for retrieving coupons with an optional condition
  let SQL = `SELECT * FROM coupons WHERE expiration_date > NOW()`;

  // Append conditions for filtering by type if specified
  if (type === "min_purchase_count") {
    SQL += ` AND min_purchase_count IS NOT NULL`;
  } else if (type === "min_purchase_cost") {
    SQL += ` AND min_purchase_cost IS NOT NULL`;
  }
  db.query(SQL, (err, coupons) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching coupons" });
    }

    const eligibleCoupons = [];
    coupons.forEach((coupon, index) => {
      checkCouponEligibility(userId, coupon, (err, isEligible) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Error checking coupon eligibility" });
        }

        if (isEligible) {
          eligibleCoupons.push(coupon);
        }

        // Only send response once all coupons have been checked
        if (index === coupons.length - 1) {
          res.json(eligibleCoupons);
        }
      });
    });
  });
});

// Apply a coupon for the user
const applyCoupon = expressAsyncHandler((req, res) => {
  const couponId = req.body.coupon_id;
  const userId = req.body.user_id || req.user.id;

  const SQL = `SELECT * FROM coupons WHERE id = ? AND expiration_date > NOW()`;
  db.query(SQL, [couponId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching coupon" });
    }

    const coupon = result[0];
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    checkCouponEligibility(userId, coupon, (err, isEligible) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error checking coupon eligibility" });
      }

      if (!isEligible) {
        return res
          .status(400)
          .json({ message: "User not eligible for this coupon" });
      }

      // Duplicate coupon fields into user_coupons
      const userCouponSQL = `
        INSERT INTO user_coupons 
        (user_id, name, description, discount_percentage, min_purchase_count, min_purchase_cost, expiration_date, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
      `;
      db.query(
        userCouponSQL,
        [
          userId,
          coupon.name,
          coupon.description,
          coupon.discount_percentage,
          coupon.min_purchase_count,
          coupon.min_purchase_cost,
          coupon.expiration_date,
        ],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error applying coupon" });
          }
          res.json({ message: "Coupon applied successfully" });
        }
      );
    });
  });
});

// Redeem a user coupon
const redeemCoupon = expressAsyncHandler((req, res) => {
  const couponId = req.body.coupon_id;
  const userId = req.body.user_id || req.user.id;

  const userCouponSQL = `SELECT * FROM user_coupons WHERE user_id = ? AND id = ? AND status = 'active'`;
  db.query(userCouponSQL, [userId, couponId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching user coupon" });
    }

    const userCoupon = result[0];
    if (!userCoupon) {
      return res
        .status(400)
        .json({ message: "Coupon not found or already used" });
    }

    const updateStatusSQL = `UPDATE user_coupons SET status = 'used' WHERE id = ?`;
    db.query(updateStatusSQL, [userCoupon.id], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error redeeming coupon" });
      }
      res.json({ message: "Coupon redeemed successfully" });
    });
  });
});

module.exports = { getEligibleCoupons, applyCoupon, redeemCoupon };
