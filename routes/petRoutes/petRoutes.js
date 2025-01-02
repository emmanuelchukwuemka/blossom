const express = require("express");
const {
  getPetTypes,
  createPetType,
  updatePetType,
  deletePetType,
} = require("../../controller/petController/petTypeController");
const { isAuthenticated } = require("../../middleware/authmiddleware");

const router = express.Router();

// Routes for pet types
router.get("/pet-types", isAuthenticated, getPetTypes);
router.post("/pet-types", isAuthenticated, createPetType);
router.put("/pet-types/:id", isAuthenticated, updatePetType);
router.delete("/pet-types/:petTypeId", isAuthenticated, deletePetType);

module.exports = router;
