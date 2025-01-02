const db = require('../../Database/db');
const asyncHandler = require('express-async-handler');

// Create a new close account request
const createCloseAccountRequest = asyncHandler(async (req, res) => {
    const { user_id, closing_reason } = req.body;

    if (!user_id || !closing_reason) {
        return res.status(400).json({ message: "User ID and closing reason are required." });
    }

    const SQL_INSERT = `INSERT INTO close_account_requests (user_id, closing_reason) VALUES (?, ?)`;
    db.query(SQL_INSERT, [user_id, closing_reason], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error creating close account request.", error: err.message });
        }
        res.status(201).json({ message: "Close account request created successfully.", id: result.insertId });
    });
});

// Delete a specific close account request by ID
const deleteCloseAccountRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL_DELETE = `DELETE FROM close_account_requests WHERE id = ?`;
    db.query(SQL_DELETE, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting close account request.", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Close account request not found." });
        }
        res.status(200).json({ message: "Close account request deleted successfully." });
    });
});

// Delete all close account requests by a specific user
const deleteAllCloseAccountRequestsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL_DELETE_ALL = `DELETE FROM close_account_requests WHERE user_id = ?`;
    db.query(SQL_DELETE_ALL, [user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error deleting close account requests.", error: err.message });
        }
        res.status(200).json({ message: `${result.affectedRows} close account requests deleted successfully.` });
    });
});

// Get all close account requests
const getAllCloseAccountRequests = asyncHandler(async (req, res) => {
    const SQL_SELECT_ALL = `SELECT * FROM close_account_requests`;
    db.query(SQL_SELECT_ALL, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving close account requests.", error: err.message });
        }
        res.status(200).json({ closeAccountRequests: results });
    });
});

// Get all close account requests by a specific user
const getAllCloseAccountRequestsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL_SELECT_BY_USER = `SELECT * FROM close_account_requests WHERE user_id = ?`;
    db.query(SQL_SELECT_BY_USER, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error retrieving close account requests.", error: err.message });
        }
        res.status(200).json({ closeAccountRequests: results });
    });
});

module.exports = {
    createCloseAccountRequest,
    deleteCloseAccountRequest,
    deleteAllCloseAccountRequestsByUser,
    getAllCloseAccountRequests,
    getAllCloseAccountRequestsByUser
};
