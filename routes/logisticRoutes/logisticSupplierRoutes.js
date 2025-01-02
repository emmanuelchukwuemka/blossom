const express = require("express");
const {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  addServiceToSupplier,
  removeServiceFromSupplier,
  getSupplierReviews,
  createSupplierReview,
  getSuppliersByServiceId
} = require("../../controller/logisticController/supplierController");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const { upload } = require("../../middleware/Multer");

const router = express.Router();

router.get("/logistic/suppliers", isAuthenticated, getAllSuppliers);
router.get("/logistic/suppliers/:id", isAuthenticated, getSupplier);
router.get("/logistic/suppliers/:id/faq", isAuthenticated, getAllFaqs);

router.post(
  "/logistic/suppliers",
  isAuthenticated,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createSupplier
);
router.put("/logistic/suppliers/:id", isAuthenticated, updateSupplier);
router.delete("/logistic/suppliers/:id", isAuthenticated, deleteSupplier);

router.post("/logistic/suppliers/:id/faq", isAuthenticated, createFaq);
router.put("/logistic/suppliers/:id/faq/:faqId", isAuthenticated, updateFaq);
router.delete("/logistic/suppliers/:id/faq/:faqId", isAuthenticated, deleteFaq);
router.post("/supplier/:supplierId/service/:serviceId", isAuthenticated, addServiceToSupplier);
router.delete("/supplier/:supplierId/service/:serviceId", isAuthenticated, removeServiceFromSupplier);
router.get("/supplier/:id/reviews", isAuthenticated, getSupplierReviews);
router.post("/supplier/:id/review", isAuthenticated, createSupplierReview);
router.get("/supplier/get-by-service-id/:serviceId", isAuthenticated, getSuppliersByServiceId);


module.exports = router;
