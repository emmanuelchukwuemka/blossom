const asyncHandler = require("express-async-handler");
const db = require('../Database/db');

// Verify Users
const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.body;

    // Handle missing `verificationToken`
    if (!verificationToken) {
        return res.status(400).json({
            status: "fail",
            message: "A valid verification token must be provided in the request body.",
        });
    }

    // Check the database for the token
    const query = 'SELECT * from Users WHERE verification_code = ? LIMIT 1';
    db.query(query, [verificationToken], async (err, results) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Database query failed",
                error: err.message,
            });
        }

        // Check if a user with the token exists
        if (results.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Invalid or expired verification token.",
            });
        }

        const user = results[0];

        // Check if the user is already verified
        if (user.is_phone_verified) {
            return res.status(400).json({
                status: "fail",
                message: "User is already verified.",
            });
        }

        // Update the user to mark as verified and clear the verification code
        const updateQuery = 'UPDATE users SET is_phone_verified = 1, verification_code = NULL WHERE id = ?';
        db.query(updateQuery, [user.id], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to update user verification status",
                    error: updateErr.message,
                });
            }

            // Successful verification
            return res.status(200).json({
                status: "success",
                message: "Account verification successful.",
            });
        });
    });
});

module.exports = verifyUser;
