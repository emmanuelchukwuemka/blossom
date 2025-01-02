const router = require("express").Router();
const {
  makeSuggestion,
  getSuggestions,
  deleteSuggestion,
} = require("../../controller/suggestionController/suggestion");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { upload } = require("../../middleware/Multer");

router.post(
  "/make-suggestion",
  isAuthenticated,
  upload.array("files", 10),
  makeSuggestion
);
router.get("/suggestions", isAuthenticated, getSuggestions);
router.delete("/suggestions/:id", isAuthenticated, deleteSuggestion);


module.exports = router;