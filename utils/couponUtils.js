const db = require("../Database/db");

// Check if a user meets the requirements for a coupon
function checkCouponEligibility(userId, coupon, callback) {
  const SQL = "SELECT purchase_count, purchase_cost FROM users WHERE id = ?";

  db.query(SQL, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return callback(err, null);
    }

    const user = result[0];
    const meetsPurchaseCount =
      !coupon.min_purchase_count ||
      user.purchase_count >= coupon.min_purchase_count;
    const meetsPurchaseCost =
      !coupon.min_purchase_cost ||
      user.purchase_cost >= coupon.min_purchase_cost;

    callback(null, meetsPurchaseCount && meetsPurchaseCost);
  });
}

module.exports = { checkCouponEligibility };
