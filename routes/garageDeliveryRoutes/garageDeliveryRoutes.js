const express = require("express");
const garageDelivery = require("../../controller/garageDeliveryController/garageDelivery");
const { isAuthenticated } = require("../../middleware/authmiddleware");

const router = express.Router();

router.post("/settings/garage-delivery", isAuthenticated, garageDelivery);

module.exports = router;
