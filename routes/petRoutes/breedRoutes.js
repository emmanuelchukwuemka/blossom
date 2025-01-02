const express = require("express");
const {
  getBreedsByType,
  createBreed,
  updateBreed,
  deleteBreed,
} = require("../../controller/petController/petBreedController");
const { isAuthenticated } = require("../../middleware/authmiddleware");

const router = express.Router();

// Routes for breeds
router.get("/breeds/:pet_type_id", isAuthenticated, getBreedsByType);
router.post("/breeds", isAuthenticated, createBreed);
router.put("/breeds/:id", isAuthenticated, updateBreed);
router.delete("/breeds/:id", isAuthenticated, deleteBreed);

module.exports = router;
