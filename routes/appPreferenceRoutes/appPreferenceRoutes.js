const express = require("express")
const router = express.Router()
const { updateAppPreference, getUserAppPreference, resetUserAppPreference,} = require("../../controller/appPreferenceController/appPreference")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")
const { logMessage } = require('../../middleware/messagesMiddleware');


router.patch("/preference/update-app-preference", isAuthenticated, logMessage("updated an app preference setting"), updateAppPreference);
router.get("/preference/get-app-preference/:userId", isAuthenticated, getUserAppPreference);
router.post("/preference/reset-app-preference", isAuthenticated, logMessage("reset app preference to default"), resetUserAppPreference);



  
 module.exports = router;
