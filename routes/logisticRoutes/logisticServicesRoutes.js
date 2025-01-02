const express = require("express");
const {
  getAllServices,
  getServicesByCategory,
  getService,
  createService,
  updateService,
  deleteService,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../../controller/logisticController/serviceController");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { upload } = require("../../middleware/Multer");

const router = express.Router();

router.get("/logistic/services", isAuthenticated, getAllServices);
router.get(
  "/logistics/services/:category",
  isAuthenticated,
  getServicesByCategory
);
router.get("/logistic/services/:id", isAuthenticated, getService);
router.get("/logistic/services/:id/reviews", isAuthenticated, getReviews);

router.post(
  "/logistic/services",
  isAuthenticated,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createService
);
router.put(
  "/logistic/services/:id",
  isAuthenticated,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  updateService
);
router.delete("/logistic/services/:id", isAuthenticated, deleteService);

router.post("/logistic/services/:id/review", isAuthenticated, createReview);
router.put(
  "/logistic/services/:id/review/:reviewId",
  isAuthenticated,
  updateReview
);
router.delete(
  "/logistic/services/:id/review/:reviewId",
  isAuthenticated,
  deleteReview
);

module.exports = router;
