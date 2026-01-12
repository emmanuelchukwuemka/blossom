const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { logMessage } = require('../../middleware/messagesMiddleware');

const router = express.Router();

// Controllers
const {
  getAccounts,
  linkAccount,
  unlinkAccount,
  updateAccount,
  getVerificationStatus,
  submitVerification,
  getAccountPermissions,
  updateAccountPermissions
} = require("../../controller/accountController/accountController");

// Get all accounts for user
router.get("/accounts", isAuthenticated, logMessage("viewed user accounts"), getAccounts);

// Link new account
router.post("/accounts/link", isAuthenticated, logMessage("linked new account"), linkAccount);

// Unlink account
router.delete("/accounts/:id", isAuthenticated, logMessage("unlinked account"), unlinkAccount);

// Update account settings
router.put("/accounts/:id", isAuthenticated, logMessage("updated account settings"), updateAccount);

// Get verification status
router.get("/accounts/verify", isAuthenticated, logMessage("checked verification status"), getVerificationStatus);

// Submit verification documents
router.post("/accounts/verify", isAuthenticated, logMessage("submitted verification documents"), submitVerification);

// Get account permissions
router.get("/accounts/permissions/:id", isAuthenticated, logMessage("viewed account permissions"), getAccountPermissions);

// Update account permissions
router.put("/accounts/permissions/:id", isAuthenticated, logMessage("updated account permissions"), updateAccountPermissions);

module.exports = router;