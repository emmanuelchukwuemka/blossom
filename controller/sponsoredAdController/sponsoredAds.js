const db = require('../../Database/db');
const asyncHandler = require("express-async-handler");


// Generate a single random ad
const getRandomAd = asyncHandler(async (req, res) => {
    const SQL = "SELECT * FROM sponsored_ads ORDER BY RAND() LIMIT 1";
    db.query(SQL, (err, result) => {
        if (err) {
            console.error("Error fetching random ad:", err);
            return res.status(500).json({ message: "Error fetching random ad" });
        }
        if (result.length > 0) {
            const transformedAd = {
                ...result[0],
                active: result[0].active === 1
            };
            return res.status(200).json(transformedAd);
        }
        res.status(404).json({ message: "No ads found" });
    });
});


// Create a new sponsored ad
const createSponsoredAd = asyncHandler(async (req, res) => {
    const { name, description, image, image_id, price, placerId, discount, totalQuantity, state, active } = req.body;

    const SQL = `INSERT INTO sponsored_ads 
        (name, description, image, image_id, price, placerId, discount, totalQuantity, state, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, description, image, image_id, price, placerId, discount, totalQuantity, state, active];

    db.query(SQL, values, (err, result) => {
        if (err) {
            console.error("Error creating sponsored ad:", err);
            return res.status(500).json({ message: "Error creating sponsored ad" });
        }
        res.status(201).json({ message: "Sponsored ad created successfully", id: result.insertId });
    });
});

// Create a sponsored ad feedback
const createSponsoredAdFeedback = asyncHandler(async (req, res) => {
    const { user_id, sponsored_ads_id, feedback, reason } = req.body;

    if (!user_id || !sponsored_ads_id || !feedback || !reason) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(feedback)) {
        return res.status(400).json({ message: "Feedback must be an array" });
    }

    // Convert feedback array to a JSON string
    const feedbackJson = JSON.stringify(feedback);

    const SQL = `INSERT INTO sponsored_ads_feedback (user_id, sponsored_ads_id, feedback, reason)
                 VALUES (?, ?, ?, ?)`;
    const values = [user_id, sponsored_ads_id, feedbackJson, reason];

    db.query(SQL, values, (err, result) => {
        if (err) {
            console.error("Error creating sponsored ad feedback:", err);
            return res.status(500).json({ message: "Error creating sponsored ad feedback" });
        }
        res.status(201).json({ message: "Feedback sent successfully", id: result.insertId });
    });
});


// Get all sponsored ads
const getAllSponsoredAds = asyncHandler(async (req, res) => {
    const SQL = "SELECT * FROM sponsored_ads";
    db.query(SQL, (err, results) => {
        if (err) {
            console.error("Error fetching sponsored ads:", err);
            return res.status(500).json({ message: "Error fetching sponsored ads" });
        }
        res.status(200).json(results);
    });
});

// Get all sponsored ads feedback
const getAllSponsoredAdsFeedback = asyncHandler(async (req, res) => {
    const SQL = "SELECT * FROM sponsored_ads_feedback";
    db.query(SQL, (err, results) => {
        if (err) {
            console.error("Error fetching sponsored ads feedback:", err);
            return res.status(500).json({ message: "Error fetching sponsored ads feedback" });
        }
        res.status(200).json(results);
    });
});

// Delete a sponsored ad
const deleteSponsoredAd = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL = "DELETE FROM sponsored_ads WHERE id = ?";
    db.query(SQL, [id], (err, result) => {
        if (err) {
            console.error("Error deleting sponsored ad:", err);
            return res.status(500).json({ message: "Error deleting sponsored ad" });
        }
        res.status(200).json({ message: "Sponsored ad deleted successfully" });
    });
});

// Delete a sponsored ad feedback
const deleteSponsoredAdFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL = "DELETE FROM sponsored_ads_feedback WHERE id = ?";
    db.query(SQL, [id], (err, result) => {
        if (err) {
            console.error("Error deleting feedback:", err);
            return res.status(500).json({ message: "Error deleting feedback" });
        }
        res.status(200).json({ message: "Feedback deleted successfully" });
    });
});




// Add sponsored ad to cart
const addSponsoredAdToCart = asyncHandler(async (req, res) => {
    const { ad_id, user_id, quantity } = req.body;

    if (!ad_id || !user_id || !quantity) {
        return res.status(400).json({ message: "ad_id, user_id, and quantity are required" });
    }

    // Fetch the sponsored ad details
    const adQuery = `SELECT * FROM sponsored_ads WHERE id = ? AND active = 1`;
    db.query(adQuery, [ad_id], (err, adResult) => {
        if (err) {
            console.error("Error fetching sponsored ad:", err);
            return res.status(500).json({ message: "Error fetching sponsored ad" });
        }

        if (adResult.length === 0) {
            return res.status(404).json({ message: "Sponsored ad not found or inactive" });
        }

        const ad = adResult[0];

        // Insert into the cart table
        const insertCartQuery = `
            INSERT INTO cart 
            (user_id, title, description, images, price, sellerId, quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const cartValues = [
            user_id,
            ad.name,
            ad.description,
            ad.image,
            ad.price,
            ad.placerId,
            quantity,
        ];

        db.query(insertCartQuery, cartValues, (cartErr, cartResult) => {
            if (cartErr) {
                console.error("Error adding item to cart:", cartErr);
                return res.status(500).json({ message: "Error adding item to cart" });
            }

            res.status(201).json({
                message: "Sponsored ad item added to cart successfully",
                cart_id: cartResult.insertId,
            });
        });
    });
});


module.exports = {
    getRandomAd,
    createSponsoredAd,
    createSponsoredAdFeedback,
    getAllSponsoredAds,
    getAllSponsoredAdsFeedback,
    deleteSponsoredAd,
    deleteSponsoredAdFeedback,
    addSponsoredAdToCart,
};
