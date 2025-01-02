const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const cloudinary = require("cloudinary").v2;
const { uploadCloudinaryBase64 } = require("../../utils/cloudinary/uploader");

// Step 2: Add pet with name and type
const addPetName = expressAsyncHandler(async (req, res) => {
  const { user_id, pet_type_id, name } = req.body;

  const SQL = `INSERT INTO user_pets (user_id, pet_type_id, name) VALUES (?, ?, ?)`;
  db.query(SQL, [user_id, pet_type_id, name], (err, result) => {
    if (err) return res.status(500).json({ message: "Error saving pet name" });
    res
      .status(201)
      .json({ message: "Pet name saved successfully", petId: result.insertId });
  });
});

// Step 3 (continued): Update pet breed and type (purebred or mixed breed)
const updatePetBreed = expressAsyncHandler(async (req, res) => {
  const { pet_id, breed_id, is_purebred } = req.body;

  const SQL = `UPDATE user_pets SET breed_id = ?, is_purebred = ? WHERE id = ?`;
  db.query(SQL, [breed_id, is_purebred, pet_id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error updating pet breed" });
    res.json({ message: "Pet breed updated successfully" });
  });
});

// Step 4: Add or update detailed information about the pet
const addPetDetails = expressAsyncHandler(async (req, res) => {
  const {
    pet_id,
    birth_date,
    age_years,
    age_months,
    weight,
    weight_unit,
    gender,
    image,
    receive_coupons,
  } = req.body;

  // Fetch existing pet details
  const SQL_FETCH_PET = `SELECT image_url, image_id FROM user_pets WHERE id = ?`;
  db.query(SQL_FETCH_PET, [pet_id], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching pet details" });
    }

    const pet = result[0];
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    let imageUrl = pet.image_url;
    let imageId = pet.image_id;

    // Handle image update if a new image is provided
    if (image) {
      try {
        if (imageId) await cloudinary.uploader.destroy(imageId);
        const cldRes = await uploadCloudinaryBase64(image);
        imageUrl = cldRes.url;
        imageId = cldRes.public_id;
      } catch (error) {
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    // Update pet details in the database
    const SQL_UPDATE_PET = `
      UPDATE user_pets SET 
        birth_date = ?, age_years = ?, age_months = ?, weight = ?, 
        weight_unit = ?, gender = ?, image_url = ?, image_id = ?, 
        receive_coupons = ? 
      WHERE id = ?
    `;
    db.query(
      SQL_UPDATE_PET,
      [
        birth_date,
        age_years,
        age_months,
        weight,
        weight_unit,
        gender,
        imageUrl,
        imageId,
        receive_coupons,
        pet_id,
      ],
      (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error updating pet details" });
        }
        res.json({ message: "Pet details updated successfully" });
      }
    );
  });
});

// Step 4 (continued): Add or update pet preferences like food brand, dietary needs, etc.
const addPetPreferences = expressAsyncHandler(async (req, res) => {
  const { pet_id, food_brand, dietary_preference, flavor, toy_preference } =
    req.body;

  const SQL = `
    UPDATE user_pets SET 
      food_brand = ?, dietary_preference = ?, flavor = ?, toy_preference = ? 
    WHERE id = ?
  `;
  db.query(
    SQL,
    [food_brand, dietary_preference, flavor, toy_preference, pet_id],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error saving pet preferences" });
      res.json({ message: "Pet preferences saved successfully" });
    }
  );
});

const getUserPets = expressAsyncHandler(async (req, res) => {
  const { user_id } = req.body;
  const SQL = `SELECT * FROM user_pets WHERE user_id = ?`;

  db.query(SQL, [user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching pets" });
    res.json(results);
  });
});

module.exports = {
  addPetName,
  updatePetBreed,
  addPetDetails,
  addPetPreferences,
  getUserPets,
};
