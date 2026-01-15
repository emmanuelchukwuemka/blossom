const db = require('../../Database/db');
const asyncHandler = require('express-async-handler');
const { getOrCreateWallet } = require('../../utils/defaultTables');

// Handle Referral Code Usage
const useReferralCode = asyncHandler(async (req, res) => {
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
        return res.status(400).json({ message: "User ID and Referral Code are required." });
    }

    // Check if referral code is valid
    const SQL_GET_REFERRER = `SELECT id from Users WHERE referral_code = ?`;
    db.query(SQL_GET_REFERRER, [referralCode], (err, referrerResults) => {
        if (err) {
            return res.status(500).json({ message: "Error checking referral code.", error: err.message });
        }
        if (!referrerResults.length) {
            return res.status(400).json({ message: "Invalid referral code." });
        }

        const referrerId = referrerResults[0].id;

        // Ensure referral code is not used by the same user
        const SQL_CHECK_ALREADY_REFERRED = `SELECT * from Users WHERE referred_by = ? AND id = ?`;
        db.query(SQL_CHECK_ALREADY_REFERRED, [referrerId, userId], (err, referredResults) => {
            if (err) {
                return res.status(500).json({ message: "Error checking referral usage.", error: err.message });
            }
            if (referredResults.length) {
                return res.status(400).json({ message: "Referral code already used." });
            }

            // Add referral relationship
            const SQL_UPDATE_REFERRAL = `UPDATE users SET referred_by = ? WHERE id = ?`;
            db.query(SQL_UPDATE_REFERRAL, [referrerId, userId], (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error saving referral relationship.", error: err.message });
                }

                // Ensure wallets exist for both users
                getOrCreateWallet(userId)
                    .then(() => getOrCreateWallet(referrerId))
                    .then(() => {
                        // Update wallets: $5 to referred user, $7 to referrer
                        const SQL_UPDATE_WALLETS = `
                            UPDATE wallet 
                            SET balance = CASE 
                                WHEN user_id = ? THEN balance + 5 
                                WHEN user_id = ? THEN balance + 7 
                            END
                            WHERE user_id IN (?, ?)
                        `;
                        db.query(SQL_UPDATE_WALLETS, [userId, referrerId, userId, referrerId], (err) => {
                            if (err) {
                                return res.status(500).json({ message: "Error updating wallets.", error: err.message });
                            }

                            res.status(200).json({
                                message: "Referral applied successfully. Wallets updated.",
                                referredUserId: userId,
                                referrerId: referrerId,
                            });
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({ message: "Error ensuring wallets.", error: err.message });
                    });
            });
        });
    });
});





// Generate Referral Code for User
const generateReferralCode = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    // SQL to check if referral code exists
    const SQL_CHECK_REFERRAL_CODE = `SELECT referral_code from Users WHERE id = ?`;

    db.query(SQL_CHECK_REFERRAL_CODE, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error checking referral code.", error: err.message });
        }

        if (results.length > 0 && results[0].referral_code) {
            // If referral code exists, return the existing code
            return res.status(200).json({
                message: "Referral code generated.",
                referralCode: results[0].referral_code,
            });
        }

        // Generate unique referral code if it doesn't exist
        const code = Array.from({ length: 8 }, () => Math.random().toString(36)[2]).join('').toUpperCase();
        const SQL_UPDATE_REFERRAL_CODE = `UPDATE users SET referral_code = ? WHERE id = ?`;

        db.query(SQL_UPDATE_REFERRAL_CODE, [code, userId], (err) => {
            if (err) {
                return res.status(500).json({ message: "Error generating referral code.", error: err.message });
            }

            res.status(200).json({
                message: "Referral code generated successfully.",
                referralCode: code,
            });
        });
    });
});


module.exports = { useReferralCode, generateReferralCode };
