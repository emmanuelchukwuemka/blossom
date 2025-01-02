const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');

// Get All USERS
const getAllUsers = asyncHandler(async (req, res) => {
    const userQuery = 'SELECT * FROM users';

    
    try {
        const [data] = await db.promise().query(userQuery);
        res.status(200).json({message: "users fetched successfully", data});
    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
});

module.exports = getAllUsers;
