const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');

// Get all USERS
const getUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Handle missing `userId`
    if (!userId) {
        return res.status(400).json({
            status: "fail",
            message: "A valid user ID must be provided in the request parameters.",
        });
    }

    const q = 'SELECT * FROM users WHERE id = ?';
    db.query(q, [userId], (err, user) => {
        if (err) {
            // Handle database errors
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while retrieving the user data.",
                error: err.message,
            });
        }

        if (user && user.length > 0) {
            // User found
            const userData = user[0];
            return res.status(200).json({
                status: "success",
                message: "User retrieved successfully.",
                user: userData,
            });
        } else {
            // User not found
            return res.status(404).json({
                status: "fail",
                message: "User does not exist.",
            });
        }
    });
});



module.exports = getUser;