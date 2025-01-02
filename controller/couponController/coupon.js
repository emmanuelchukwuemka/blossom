const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

// retrieves all coupons or filters by type
const getCoupons = expressAsyncHandler((req, res) => {
  const { type } = req.body;

  let SQL = `SELECT * FROM coupons`;

  // Append conditions for filtering by type if specified
  if (type === "min_purchase_count") {
    SQL += ` WHERE min_purchase_count IS NOT NULL`;
  } else if (type === "min_purchase_cost") {
    SQL += ` WHERE min_purchase_cost IS NOT NULL`;
  }

  db.query(SQL, (err, coupons) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching coupons" });
    }
    res.json(coupons);
  });
});

// creates a new coupon
const createCoupon = expressAsyncHandler((req, res) => {
  const {
    name,
    description,
    discount_percentage,
    min_purchase_count,
    min_purchase_cost,
    expiration_date,
  } = req.body;

  const SQL = `INSERT INTO coupons (name, description, discount_percentage, min_purchase_count, min_purchase_cost, expiration_date) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    SQL,
    [
      name,
      description,
      discount_percentage,
      min_purchase_count,
      min_purchase_cost,
      expiration_date,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating coupon" });
      }
      res.status(201).json({
        message: "Coupon created successfully",
        couponId: result.insertId,
      });
    }
  );
});




//update an existing coupon
const updateCoupon = expressAsyncHandler((req, res) => {
  const {
    id,
    name,
    description,
    discount_percentage,
    min_purchase_count,
    min_purchase_cost,
    expiration_date,
  } = req.body;

  // SQL query to check if the coupon exists
  const checkSQL = `SELECT id FROM coupons WHERE id = ?`;
  
  db.query(checkSQL, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error checking coupon existence" });
    }

    if (result.length === 0) {
      // No coupon found with the given id
      return res.status(404).json({ message: "Coupon not found" });
    }

    // If coupon exists, proceed with the update
    const updateSQL = `
      UPDATE coupons 
      SET name = ?, description = ?, discount_percentage = ?, min_purchase_count = ?, min_purchase_cost = ?, expiration_date = ? 
      WHERE id = ?`;
    
    db.query(
      updateSQL,
      [
        name,
        description,
        discount_percentage,
        min_purchase_count,
        min_purchase_cost,
        expiration_date,
        id,
      ],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error updating coupon" });
        }

        res.json({ message: "Coupon updated successfully" });
      }
    );
  });
});


// deletes a coupon
const deleteCoupon = expressAsyncHandler((req, res) => {
  const { id } = req.body;

  const SQL = `DELETE FROM coupons WHERE id = ?`;
  db.query(SQL, [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error deleting coupon" });
    }
    res.json({ message: "Coupon deleted successfully" });
  });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
