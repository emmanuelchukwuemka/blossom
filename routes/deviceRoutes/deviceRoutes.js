const express = require("express");
const { isAuthenticated } = require("../../middleware/authmiddleware");
const getDevices = require("../../controller/deviceController/getDevices");
const getAllContents = require("../../controller/deviceController/getAllContent");

const router = express.Router();

router.get("/manage/devices", isAuthenticated, getDevices);
router.get("/manage/contents", isAuthenticated, getAllContents);

module.exports = router;
