const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const parser = require("ua-parser-js");
const { generateToken, hashToken } = require("../../utils");
const sendEmail = require('../../utils/sendEmail');
const crypto = require("crypto");
const db = require('../../Database/db');
const { getOrCreateAppPreference, getOrCreateNotifications, getOrCreateWallet } = require("../../utils/defaultTables");


// Register USER
const register = asyncHandler(async (req, res) => {
    const { user_type, name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all the required fields.");
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters.");
    }

    // Check if the user exists
    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q, [email], async (err, userExists) => {
        if (err) return console.log(err);
        if (userExists[0]) return res.status(400).json({ status: "error", error: "User already exists, please login instead." });

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);
// Get UserAgent
const ua = parser(req.headers['user-agent']);
const userAgent = [ua.ua]

        // Generate OTP
        const otpCodeVerify = crypto.randomInt(100000, 999999);

        // Insert new user (only name, email, and password)
        const SQL = `INSERT INTO users(user_type, name, email, verification_code, password, is_fast_food_grocery, coupon_code) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.query(SQL, [user_type || "customer", name, email, otpCodeVerify, password_hash, false, "default_coupon"], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500);
                throw new Error("Database error");
            }

            // Retrieve the inserted user ID for token generation
            const userId = result.insertId;
            const token = generateToken(userId);
            // Create app_preference, notifications and wallet if not present
            await getOrCreateAppPreference(userId);
            await getOrCreateNotifications(userId);
            await getOrCreateWallet(userId);

            // Send HTTP response with token cookie
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // 1 day
                sameSite: "none",
            });

            // Send OTP email
            const html = `<p>
                <h3>Account Successfully Registered</h3>
                <h4>Your OTP code is ${otpCodeVerify}</h4>
                <br/><br/><br/>
                <h4>Dear ${name},</h4>
                <p>Congratulations on successfully creating an Account with Bloomzon. To verify your Account, use the code: ${otpCodeVerify}. If you did not register, please ignore this email.</p>
            </p>`;
            
            await sendEmail({
                to: email,
                subject: 'Verify Your Account', 
                html});

            // Respond with user data and token
            res.status(201).json({
                id: userId,
                name,
                email,
                token,
            });
        });
    });
});

module.exports = register;
