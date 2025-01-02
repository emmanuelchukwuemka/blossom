const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const db = require('../Database/db');
const ErrorResponse = require('../utils/errorResponse');

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(400)
            throw new Error("you are not Authorized, please login");
        }

        //  verify token
        const q = ' SELECT * FROM bloomzon.users WHERE id = ?'
        const verified = jwt.verify(token, process.env.JWT_SECTRET);

        db.query(q, [verified], async (err, result) => {
            // Get user id frrom token
            const user = req.user = result[0].id
            if (!user) {
                res.status(404)
                throw new Error("user not find");
            }
            if (user.role === "suspended") {
                res.status(400)
                throw new Error("user suspended, please contact support");
            }
            req.user = user;
            next();
        })
        // const verified = jwt.verify(token, process.env.JWT_SECTRET);

        // const user = await (verified.id).select("-password");

    } catch (err) {
        res.status(401)
        throw new Error("you are not Authorized, please login");
    }
});


const isAuthenticated = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      // return next(new ErrorResponse("Unauthorized, Token Required", 401));
      return res.status(401).json({
        message: "Unauthorized, Token Required",
      });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECTRET); // Fix typo here
      const q = 'SELECT * FROM users WHERE id = ?';
      db.query(q, [decoded.id], (err, results) => {
        if (err) {
          return res.status(500).json({
            message: "Database error while fetching user",
            error: err.message
          });
        }
  
        if (results && results.length > 0) {
          const userData = results[0];
          req.user = userData;

        //   console.log("Authenticated user:", userData);
          next();
        } else {
          return res.status(401).json({
            message: "The user belonging to this token no longer exists",
          });
        }
      });
    } catch (error) {
      return next(new ErrorResponse("Unauthorized, Invalid Token", 401));
    }
  });
  
  

const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as admin");
    }
})
const authorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "author" || req.user.role === "admin") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as author");
    }
})
const riderOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "rider") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as rider");
    }
})
const vendorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "vendor") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as rider");
    }
})


const verifiedOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized account not verified");
    }
})

module.exports = {
    isAuthenticated,
    protect,
    adminOnly,
    riderOnly,
    verifiedOnly,
    authorOnly,
    vendorOnly
}