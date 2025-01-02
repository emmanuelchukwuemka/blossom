const express = require("express");
const router = express.Router();
const { addPet, addSimplePet, getAllPets, getPetsByUser, updatePet, deletePet, deletePetsByUser } = require("../../controller/petController/mainPetController");
const { isAuthenticated } = require("../../middleware/authmiddleware");

router.post("/pets", isAuthenticated, addPet);
router.post("/pets/simple", isAuthenticated, addSimplePet);
router.get("/pets", isAuthenticated, getAllPets);
router.get("/pets/user/:user_id", isAuthenticated, getPetsByUser);
router.patch("/pets/:id", isAuthenticated, updatePet);
router.delete("/pets/:id", isAuthenticated, deletePet);
router.delete("/pets/user/:user_id", isAuthenticated, deletePetsByUser);

module.exports = router;
