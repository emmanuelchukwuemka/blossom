const express = require("express")
const router = express.Router()
const { registerBusiness,
    verifyBusinessOtp,
    resendBusinessOtp,
    loginBusiness,
    updateBusinessProfile,
    getAllBusinessAccountDetails,
    getSingleBusinessAccountDetails,
testMail,
} = require("../../controller/businessController/businessAuth")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")





router.post("/business/create-account", isAuthenticated, registerBusiness);
router.post("/business/login-account", isAuthenticated, loginBusiness);
router.post("/business/verify-email-otp", isAuthenticated, verifyBusinessOtp);
router.post("/business/resend-email-otp", isAuthenticated, resendBusinessOtp);
router.get("/business/get-all-business-profiles/:user_id", isAuthenticated, getAllBusinessAccountDetails);
router.get("/business/get-single-business-profile/:business_email", isAuthenticated, getSingleBusinessAccountDetails);
router.patch("/business/update-business-profile", isAuthenticated, updateBusinessProfile);
router.post("/business/test-mail", testMail);

  
 module.exports = router;
