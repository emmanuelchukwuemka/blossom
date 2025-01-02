const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/authmiddleware');
const { useReferralCode, generateReferralCode } = require('../../controller/referralController/referral');

// Route to apply referral code
router.post('/referral/use', isAuthenticated, useReferralCode);
// Route to generate referral code
router.post('/referral/generate', isAuthenticated, generateReferralCode);

module.exports = router;
