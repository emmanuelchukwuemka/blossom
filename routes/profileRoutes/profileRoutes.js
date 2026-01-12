const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { logMessage } = require('../../middleware/messagesMiddleware');

const router = express.Router();

// Controllers
const {
  submitProfileVerification,
  getPrivacySettings,
  updatePrivacySettings,
  getUserBadges,
  customizeProfile
} = require("../../controller/profileController/profileController");

// Submit profile verification
router.post("/profiles/verify", isAuthenticated, logMessage("submitted profile verification"), submitProfileVerification);

// Get privacy settings
router.get("/profiles/privacy", isAuthenticated, logMessage("viewed privacy settings"), getPrivacySettings);

// Update privacy settings
router.put("/profiles/privacy", isAuthenticated, logMessage("updated privacy settings"), updatePrivacySettings);

// Get user badges
router.get("/profiles/badges", isAuthenticated, logMessage("viewed user badges"), getUserBadges);

// Customize profile
router.post("/profiles/customize", isAuthenticated, logMessage("customized profile"), customizeProfile);

module.exports = router;