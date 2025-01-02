const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

// Get all breeds for a specific pet type
const getBreedsByType = expressAsyncHandler(async (req, res) => {
  const { pet_type_id } = req.body;

  const SQL = `SELECT id, name FROM pet_breeds WHERE pet_type_id = ?`;
  db.query(SQL, [pet_type_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching breeds" });
    res.json(results);
  });
});

// Create a new breed for a specific pet type
const createBreed = expressAsyncHandler(async (req, res) => {
  const { pet_type_id, name } = req.body;

  const SQL = `INSERT INTO pet_breeds (pet_type_id, name) VALUES (?, ?)`;
  db.query(SQL, [pet_type_id, name], (err, result) => {
    if (err) return res.status(500).json({ message: "Error creating breed" });
    res.status(201).json({
      message: "Breed created successfully",
      breedId: result.insertId,
    });
  });
});

// Update an existing breed
const updateBreed = expressAsyncHandler(async (req, res) => {
  const { breed_id, name } = req.body;

  const SQL = `UPDATE pet_breeds SET name = ? WHERE id = ?`;
  db.query(SQL, [name, breed_id], (err) => {
    if (err) return res.status(500).json({ message: "Error updating breed" });
    res.json({ message: "Breed updated successfully" });
  });
});

// Delete a breed
const deleteBreed = expressAsyncHandler(async (req, res) => {
  const { breed_id } = req.body;

  const SQL = `DELETE FROM pet_breeds WHERE id = ?`;
  db.query(SQL, [breed_id], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting breed" });
    res.json({ message: "Breed deleted successfully" });
  });
});

module.exports = { getBreedsByType, createBreed, updateBreed, deleteBreed };
