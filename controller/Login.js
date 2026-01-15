const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require('../Database/db');
const { generateToken, hashToken } = require("../utils");

// Login USERS
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: "Please enter email and password" });
    }

    // Query to find user by email
    const q = 'SELECT * from Users WHERE email = ?';
    db.query(q, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }


        //  Trigger 2FA for unknow userAgent
        // Get UserAgent
        // const ua = parser(req.headers['user-agent']);
        // const thisUserAgent = ua.ua;
        // console.log(thisUserAgent);
        // const allowedAgent = user.userAgent.includes(thisUserAgent);
        // if (!allowedAgent) {
        //     // Generate 6 digit code
        //     const loginCode = Math.floor(100000 + Math.random() * 900000);

        //     console.log(loginCode);
        //     // Encrypt loginCode before saving to Database
        //     const encryptedLoginCode = await cryptr.encrypt(loginCode.toString());
        //     console.log(encryptedLoginCode);
            // Delete token if its exist in Database
            // let userToken = await jwt.sign({ id: user[0].id }, process.env.JWT_SECTRET);

            // if (userToken) {
            //     const Token = 'DELETE * FROM token WHERE token = ?'
            //     db.query(Token, [user], async (err, data) => {
            //         if (err) throw err;
            //         await userToken.Token
            //         console.log(data.Token)
            //         throw new Error("token delete successfully");
            //     })
        //         // Save token and save 
        //         const cookieOption = ({
        //             // expiresIn:
        //             userId: user[0].id,
        //             loginToken: encryptedLoginCode,
        //             createAt: Date.now(),
        //             expireAt: Date.now() + 60 * (60 * 1000) // 1hr
        //         });
        //         console.log(cookieOption);
        //         throw new Error("New device detected, Check your email for login code");
        //     }

        // }



        // Check if user exists
        const user = result[0];
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateToken(user.id); // Token valid for 1 day

        // Send token via HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        });

        // Send back user data and token
        const { id, name, email, user_type } = user;
        res.status(200).json({
            message: 'User logged In successfully', 
            data: {
            id,
            name,
            email,
            user_type,
            token
        }
        });
    });
});

module.exports = loginUser;