const express = require("express");

const addAddress = require("../../controller/addressController/addAddress.js");
const getAllPickupLocation = require("../../controller/addressController/getAllPickupLocation.js");
const addUserPickupLocation = require("../../controller/addressController/addUserPickupLocation.js");
const { isAuthenticated } = require("../../middleware/authmiddleware.js");

const router = express.Router();

router.post("/addresses/add", isAuthenticated, addAddress);
router.get(
  "/addresses/pickup-locations",
  isAuthenticated,
  getAllPickupLocation
);
router.post(
  "/addresses/pickup-locations/add",
  isAuthenticated,
  addUserPickupLocation
);

module.exports = router;
