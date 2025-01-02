// vehicleRoutes.js
const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const {
  searchVehicle,
  addVehicle,
  getAllVehicles,
  getUserVehicles,
  updateVehicleDetails,
  removeVehicleFromGarage,
  getUserSpecificVehicle,
} = require("../../controller/garageController/garage");
const {
  getVehicleCategories,
  getVehiclesAccessories,
  searchVehicleAccessories,
  createVehicleCategory,
  createVehicleAccessory,
} = require("../../controller/garageController/vehicle");
const { upload } = require("../../middleware/Multer");

const router = express.Router();

router.post("/garage/search", isAuthenticated, searchVehicle);
router.post("/garage/add", isAuthenticated, addVehicle);
router.get("/garage/all", isAuthenticated, getAllVehicles);
router.get("/garage/user/:userId", isAuthenticated, getUserVehicles);
router.get("/garage/specific/:vehicleId", isAuthenticated, getUserSpecificVehicle);
router.patch("/garage/update", isAuthenticated, updateVehicleDetails);
router.delete("/garage/delete/:vehicleId", isAuthenticated, removeVehicleFromGarage);



// Get featured categories that fall under Part & Accessories of Vehicle
router.get("/garage/all/categories", isAuthenticated, getVehicleCategories);

router.get(
  "/garage/products/search",
  isAuthenticated,
  searchVehicleAccessories
);
router.get(
  "/garage/products-accesories/:categoryId",
  isAuthenticated,
  getVehiclesAccessories
);

// create vehicle category and vehicle accessory (admin use case)
router.post(
  "/garage/categories/create",
  isAuthenticated,
  createVehicleCategory
);

router.post(
  "/garage/products/create",
  isAuthenticated,
  upload.array("images", 10),
  createVehicleAccessory
);

module.exports = router;
