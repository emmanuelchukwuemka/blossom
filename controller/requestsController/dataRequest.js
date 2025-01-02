const db = require('../../Database/db');
const asyncHandler = require('express-async-handler');

// Create a new account data request
const createAccountDataRequest = asyncHandler(async (req, res) => {
    const { user_id, data_category } = req.body;

    if (!user_id || !data_category) {
        return res.status(400).json({ message: "User ID and data category are required." });
    }

    const SQL_INSERT = `INSERT INTO account_data_requests (user_id, data_category) VALUES (?, ?)`;
    db.query(SQL_INSERT, [user_id, data_category], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating account data request.", error: err.message });
        }
        res.status(201).json({ message: "Account data request created successfully.", id: result.insertId });
    });
});

// Delete a specific account data request by ID
const deleteAccountDataRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL_DELETE = `DELETE FROM account_data_requests WHERE id = ?`;
    db.query(SQL_DELETE, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting account data request.", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Account data request not found." });
        }
        res.status(200).json({ message: "Account data request deleted successfully." });
    });
});

// Delete all account data requests by a specific user
const deleteAllAccountDataRequestsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL_DELETE_ALL = `DELETE FROM account_data_requests WHERE user_id = ?`;
    db.query(SQL_DELETE_ALL, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting account data requests.", error: err.message });
        }
        res.status(200).json({ message: `${result.affectedRows} account data requests deleted successfully.` });
    });
});

// Get all account data requests
const getAllAccountDataRequests = asyncHandler(async (req, res) => {
    const SQL_SELECT_ALL = `SELECT * FROM account_data_requests`;
    db.query(SQL_SELECT_ALL, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving account data requests.", error: err.message });
        }
        res.status(200).json({ accountDataRequests: results });
    });
});

// Get all account data requests by a specific user
const getAllAccountDataRequestsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL_SELECT_BY_USER = `SELECT * FROM account_data_requests WHERE user_id = ?`;
    db.query(SQL_SELECT_BY_USER, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving account data requests.", error: err.message });
        }
        res.status(200).json({ accountDataRequests: results });
    });
});

module.exports = {
    createAccountDataRequest,
    deleteAccountDataRequest,
    deleteAllAccountDataRequestsByUser,
    getAllAccountDataRequests,
    getAllAccountDataRequestsByUser
};
