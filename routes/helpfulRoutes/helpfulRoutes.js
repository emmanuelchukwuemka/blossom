const express = require("express")
const router = express.Router()
const { getArticleVotes, getUserVote, submitVote, getAllVotes } = require("../../controller/isHelpfulController/isContentHelpful.js")
const { isAuthenticated, protect, adminOnly, riderOnly, verifiedOnly, authorOnly, vendorOnly } = require("../../middleware/authmiddleware");
const { logMessage } = require('../../middleware/messagesMiddleware');




router.get("/helpful/get-votes", isAuthenticated,  getArticleVotes);
router.get("/helpful/get-user-vote", isAuthenticated, getUserVote);
router.post("/helpful/submit-vote", isAuthenticated, logMessage("submitted a vote for helpful item"), submitVote);
router.get("/helpful/get-all-votes", isAuthenticated, getAllVotes);

  
 module.exports = router;
