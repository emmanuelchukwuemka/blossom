const express = require("express")
const router = express.Router()
const {upload} = require('../../middleware/Multer')

const { getFanShopLeagues, getFanShopApparels, getFanShopTeams, getAllLeaguesByAdmin, getAllLeaguesByUser, createFanShopLeague, createFanShopApparel, createFanShopTeam, getFanShopFollowing, updateFanShopLeague, updateFanShopApparel, updateFanShopTeam, followFanShopTeam, addApparelToCart} = require("../../controller/fanshopController/fanshop")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware")




router.get("/fanshop/get-leagues", isAuthenticated, getFanShopLeagues);
router.get("/fanshop/get-apparels", isAuthenticated, getFanShopApparels);
router.get("/fanshop/get-teams/:userId", isAuthenticated, getFanShopTeams);
router.get("/fanshop/admin-get-all", isAuthenticated, getAllLeaguesByAdmin);
router.get("/fanshop/user-get-all", isAuthenticated, getAllLeaguesByUser);
router.post("/fanshop/create-league",  isAuthenticated, createFanShopLeague);
router.post("/fanshop/create-apparel", isAuthenticated, createFanShopApparel);
router.post("/fanshop/create-team", isAuthenticated, createFanShopTeam);
router.get("/fanshop/following-team/:userId", isAuthenticated, getFanShopFollowing);
router.patch("/fanshop/update-league", isAuthenticated, updateFanShopLeague);
router.patch("/fanshop/update-apparel", isAuthenticated, updateFanShopApparel);
router.patch("/fanshop/update-team", isAuthenticated, updateFanShopTeam);
router.post("/fanshop/follow-team", isAuthenticated, followFanShopTeam);
router.post("/fanshop/apparel-to-cart", isAuthenticated, addApparelToCart);
// router.post("/notifications/test", upload.array('business_proofs_of_work',10), testImagesUpload);

  
 module.exports = router;