const express = require("express")
const router = express.Router()
const {upload} = require('../../middleware/Multer')

const { promotion, activities, cartproducts, inquiry, getNotifications, resetNotifications, testImagesUpload} = require("../../controller/notificationController/notifications")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")
const { logMessage } = require('../../middleware/messagesMiddleware');




router.patch("/notifications/promotion", isAuthenticated, logMessage("edited a promotional notification"), promotion);
router.patch("/notifications/activity", isAuthenticated, logMessage("edited an activity notification"), activities);
router.patch("/notifications/cart-products", isAuthenticated, logMessage("edited a cart product notification"), cartproducts);
router.patch("/notifications/inquiry", isAuthenticated, logMessage("edited an inquiry notification"), inquiry);
router.get("/notifications/get-user-notification/:userId",  isAuthenticated, getNotifications);
router.post("/notifications/reset-user-notification/:userId", isAuthenticated, logMessage("you reset your notification to default"), resetNotifications);
router.post("/notifications/test", upload.array('business_proofs_of_work',10), testImagesUpload);

  
 module.exports = router;
