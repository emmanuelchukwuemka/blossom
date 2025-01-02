const db = require("../../Database/db");
const asyncHandler = require("express-async-handler");
const { uploadCloudinaryBase64 } = require("../../utils/cloudinary/uploader");

// Helper to parse JSON fields safely
const parseJSONFields = (pet) => {
    const fields = ['food_brand', 'dietary_preference', 'flavor', 'toy_preference'];
    fields.forEach((field) => {
        if (pet[field]) {
            try {
                pet[field] = JSON.parse(pet[field]);
            } catch {
                pet[field] = [];
            }
        }
    });
    return pet;
};

// Add a new pet
const addPet = asyncHandler(async (req, res) => {
    const { 
        user_id, 
        pet_type_id, 
        name, 
        is_purebred, 
        birth_date, 
        age_years, 
        age_months, 
        weight, 
        weight_unit, 
        gender, 
        receive_coupons, 
        image, // This is the base64 file
        food_brand, 
        dietary_preference, 
        flavor, 
        toy_preference 
    } = req.body;

    let imageUrl = null;
    let imageId = null;

    if (!image) {
        return res.status(400).json({ message: "Image field must be provided" });
    }

    try {
        const cldRes = await uploadCloudinaryBase64(image); // Pass the base64 file to Cloudinary
        imageUrl = cldRes.url;
        imageId = cldRes.public_id;
    } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ message: "Error uploading image" });
    }

    const SQL = `
        INSERT INTO my_pets 
        (user_id, pet_type_id, name, is_purebred, birth_date, age_years, age_months, weight, weight_unit, gender, receive_coupons, image_url, image_id, food_brand, dietary_preference, flavor, toy_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        user_id, 
        pet_type_id, 
        name, 
        is_purebred, 
        birth_date, 
        age_years, 
        age_months, 
        weight, 
        weight_unit, 
        gender, 
        receive_coupons, 
        imageUrl, 
        imageId,
        JSON.stringify(food_brand || []), 
        JSON.stringify(dietary_preference || []), 
        JSON.stringify(flavor || []), 
        JSON.stringify(toy_preference || [])
    ];

    db.query(SQL, values, (err, result) => {
        if (err) {
            console.error("Error adding pet:", err);
            return res.status(500).json({ message: "Error adding pet" });
        }
        res.status(201).json({ message: "Pet added successfully", id: result.insertId });
    });
});



const addSimplePet = asyncHandler(async (req, res) => {
    const { user_id, pet_type_id, name, is_purebred, image, age_years, age_months } = req.body;

    // Validate required fields
    if (!user_id || !pet_type_id || !name || image === undefined) {
        return res.status(400).json({ message: "Required fields are missing" });
    }

    let imageUrl = null;
    let imageId = null;

    // Upload image to Cloudinary
    try {
        const cldRes = await uploadCloudinaryBase64(image);
        imageUrl = cldRes.url;
        imageId = cldRes.public_id;
    } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ message: "Error uploading image" });
    }

    const SQL = `
        INSERT INTO my_pets 
        (user_id, pet_type_id, name, is_purebred, age_years, age_months, image_url, image_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [user_id, pet_type_id, name, is_purebred, age_years, age_months, imageUrl, imageId];

    db.query(SQL, values, (err, result) => {
        if (err) {
            console.error("Error adding pet:", err);
            return res.status(500).json({ message: "Error adding pet" });
        }
        res.status(201).json({ message: "Pet added successfully", id: result.insertId });
    });
});



// Get all pets
const getAllPets = asyncHandler(async (req, res) => {
    const SQL = "SELECT * FROM my_pets";
    db.query(SQL, (err, results) => {
        if (err) {
            console.error("Error fetching pets:", err);
            return res.status(500).json({ message: "Error fetching pets" });
        }
        const pets = results.map(parseJSONFields);
        res.status(200).json({ pets });
    });
});

// Get all pets belonging to a user
const getPetsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL = "SELECT * FROM my_pets WHERE user_id = ?";
    db.query(SQL, [user_id], (err, results) => {
        if (err) {
            console.error("Error fetching user's pets:", err);
            return res.status(500).json({ message: "Error fetching user's pets" });
        }
        const pets = results.map(parseJSONFields);
        res.status(200).json({ pets });
    });
});

// Update a pet's fields (PATCH)
const updatePet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).filter((field) => field !== 'id' && field !== 'user_id');
    const values = fields.map((field) => {
        if (['food_brand', 'dietary_preference', 'flavor', 'toy_preference'].includes(field)) {
            return JSON.stringify(updates[field]);
        }
        return updates[field];
    });

    if (fields.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
    }

    const SQL = `UPDATE my_pets SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`;
    db.query(SQL, [...values, id], (err, result) => {
        if (err) {
            console.error("Error updating pet:", err);
            return res.status(500).json({ message: "Error updating pet" });
        }
        res.status(200).json({ message: "Pet updated successfully" });
    });
});

// Delete a pet
const deletePet = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL = "DELETE FROM my_pets WHERE id = ?";
    db.query(SQL, [id], (err, result) => {
        if (err) {
            console.error("Error deleting pet:", err);
            return res.status(500).json({ message: "Error deleting pet" });
        }
        res.status(200).json({ message: "Pet deleted successfully" });
    });
});

// Delete all pets belonging to a user
const deletePetsByUser = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const SQL = "DELETE FROM my_pets WHERE user_id = ?";
    db.query(SQL, [user_id], (err, result) => {
        if (err) {
            console.error("Error deleting user's pets:", err);
            return res.status(500).json({ message: "Error deleting user's pets" });
        }
        res.status(200).json({ message: "All pets belonging to user deleted successfully" });
    });
});

module.exports = {
    addPet,
    addSimplePet,
    getAllPets,
    getPetsByUser,
    updatePet,
    deletePet,
    deletePetsByUser,
};
