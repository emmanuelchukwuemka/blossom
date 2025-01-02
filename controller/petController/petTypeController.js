const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const cloudinary = require("cloudinary").v2;
const { uploadCloudinaryBase64 } = require("../../utils/cloudinary/uploader");

// Get all pet types
const getPetTypes = expressAsyncHandler(async (req, res) => {
  const SQL = `SELECT id, name, image_url, image_id FROM pet_types`;

  db.query(SQL, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching pet types" });
    res.json(results);
  });
});

// Create a new pet type
const createPetType = expressAsyncHandler(async (req, res) => {
  const { name, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  let imageUrl = null;
  let imageId = null;
  if (image) {
    const cldRes = await uploadCloudinaryBase64(image);
    imageUrl = cldRes.url;
    imageId = cldRes.public_id;
  }

  const SQL = `INSERT INTO pet_types (name, image_url, image_id) VALUES (?, ?, ?)`;
  db.query(SQL, [name, imageUrl, imageId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error creating pet type" });
    }

    res.status(201).json({
      message: "Pet type created successfully",
      pet_type_id: result.insertId,
    });
  });
});

// Update an existing pet type
const updatePetType = expressAsyncHandler(async (req, res) => {
  const { name, image } = req.body;
  const pet_type_id = req.body.pet_type_id || req.params.id;

  // Check if pet_type_id is provided
  if (!pet_type_id) {
    return res.status(400).json({ message: "Pet type ID is required" });
  }

  // SQL to fetch pet type by ID
  const SQL_FETCH_PET_TYPE = `SELECT image_url, image_id FROM pet_types WHERE id = ?`;

  db.query(SQL_FETCH_PET_TYPE, [pet_type_id], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching pet type" });
    }

    const petType = result[0];
    if (!petType) {
      // If pet type does not exist, return a 404 error
      return res.status(404).json({ message: "Pet type not found" });
    }

    // Prepare to update the pet type
    let imageUrl = petType.image_url;
    let imageId = petType.image_id;

    if (image) {
      try {
        // If the pet type has an existing image, delete it
        if (imageId) {
          await cloudinary.uploader.destroy(imageId);
        }
        // Upload the new image to Cloudinary
        const cldRes = await uploadCloudinaryBase64(image);
        imageUrl = cldRes.url;
        imageId = cldRes.public_id;
      } catch (uploadErr) {
        console.error(uploadErr);
        return res.status(500).json({ message: "Error uploading image" });
      }
    }

    // SQL to update the pet type
    const SQL_UPDATE_PET_TYPE = `UPDATE pet_types SET name = ?, image_url = ?, image_id = ? WHERE id = ?`;

    db.query(SQL_UPDATE_PET_TYPE, [name, imageUrl, imageId, pet_type_id], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error updating pet type" });
      }
      res.json({ message: "Pet type updated successfully" });
    });
  });
});


// Delete a pet type
const deletePetType = expressAsyncHandler(async (req, res) => {
  const id = req.params.petTypeId;

  // fetch pet type
  const SQL_FETCH_PET_TYPE = `SELECT image_url, image_id FROM pet_types WHERE id = ?`;
  db.query(SQL_FETCH_PET_TYPE, [id], async (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching pet type" });

    const petType = result[0];
    if (!petType) {
      return res.status(404).json({ message: "Pet type not found" });
    }

    if (petType.image_id) await cloudinary.uploader.destroy(petType.image_id);

    const SQL_DELETE_PET_TYPE = `DELETE FROM pet_types WHERE id = ?`;
    db.query(SQL_DELETE_PET_TYPE, [id], (err) => {
      if (err)
        return res.status(500).json({ message: "Error deleting pet type" });
      res.json({ message: "Pet type deleted successfully" });
    });
  });
});

module.exports = { getPetTypes, createPetType, updatePetType, deletePetType };
