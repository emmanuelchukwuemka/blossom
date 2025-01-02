const express = require("express");
const {
  addPetName,
  updatePetBreed,
  addPetDetails,
  addPetPreferences,
  getUserPets,
} = require("../../controller/petController/userPetController");
const { isAuthenticated } = require("../../middleware/authmiddleware");

const router = express.Router();

router.post("/user/pets/name", isAuthenticated, addPetName);

router.post("/user/pets/breed", isAuthenticated, updatePetBreed);

router.post("/user/pets/details", isAuthenticated, addPetDetails);

router.post("/user/pets/preferences", isAuthenticated, addPetPreferences);

router.get("/user/pets", isAuthenticated, getUserPets);

module.exports = router;
