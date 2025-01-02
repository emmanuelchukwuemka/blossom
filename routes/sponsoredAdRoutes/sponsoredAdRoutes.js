const express = require("express");
const router = express.Router();
const {
    getRandomAd,
    createSponsoredAd,
    createSponsoredAdFeedback,
    getAllSponsoredAds,
    getAllSponsoredAdsFeedback,
    deleteSponsoredAd,
    deleteSponsoredAdFeedback,
    addSponsoredAdToCart
} = require("../../controller/sponsoredAdController/sponsoredAds.js");
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware");




router.get("/sponsored-ads/random", isAuthenticated, getRandomAd);
router.get("/sponsored-ads/random-one", isAuthenticated, getRandomAd);
router.get("/sponsored-ads/random-two", isAuthenticated, getRandomAd);
router.get("/sponsored-ads/random-three", isAuthenticated, getRandomAd);
router.post("/sponsored-ads", isAuthenticated, createSponsoredAd);
router.post("/sponsored-ads/feedback", isAuthenticated, createSponsoredAdFeedback);
router.get("/sponsored-ads", isAuthenticated, getAllSponsoredAds);
router.get("/sponsored-ads/feedback", isAuthenticated, getAllSponsoredAdsFeedback);
router.delete("/sponsored-ads/:id", isAuthenticated, deleteSponsoredAd);
router.delete("/sponsored-ads/feedback/:id", isAuthenticated, deleteSponsoredAdFeedback);
router.post("/sponsored-ads/add-to-cart", isAuthenticated, addSponsoredAdToCart);


module.exports = router;