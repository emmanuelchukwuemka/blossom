const express = require("express");
const {
  getReviews,
  likeDislikeReview,
  createReview,
} = require("../../controller/reviewController/giftcardReviewController");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { upload } = require("../../middleware/Multer");

const router = express.Router();

// giftcard review routes
router.get("/reviews/giftcard/:type", isAuthenticated, getReviews);
router.patch(
  "/reviews/giftcard/like-dislike",
  isAuthenticated,
  likeDislikeReview
);
router.post(
  "/reviews/giftcard/:type/create",
  isAuthenticated,
  upload.array("files", 10),
  createReview
);

// product review routes
// router.get("/reviews/product/:type", getProductReviews);
// router.patch(
//   "/reviews/product/like-dislike",
//   isAuthenticated,
//   likeDislikePeoductReview
// );
// router.post(
//   "/reviews/product/:type/create",
//   isAuthenticated,
//   upload.array("files", 10),
//   createProductReview
// );

// content/post review routes
// router.get("/reviews/content/:type", getReviews);
// router.patch(
//   "/reviews/content/like-dislike",
//   isAuthenticated,
//   likeDislikeReview
// );
// router.post(
//   "/reviews/content/:type/create",
//   isAuthenticated,
//   upload.array("files", 10),
//   createReview
// );

// other review routes

module.exports = router;
