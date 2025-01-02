const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");

// Search for a vehicle by license plate and state
const searchVehicle = expressAsyncHandler((req, res) => {
  const { license_plate, state } = req.body;

  // TODO: Simulate a third-party API call or external lookup
  // I assume this uses external API
  const simulatedResults = {
    type: "Sedan",
    year: 2021,
    make: "Toyota",
    model: "Camry",
  };

  if (!simulatedResults && simulatedResults.length === 0) {
    return res
      .status(404)
      .json({ message: "Vehicle not found, use the add vehicle option" });
  }

  // Send the simulated result to the frontend
  res.json(simulatedResults);
});

// Add a new vehicle to the system manually
const addVehicle = expressAsyncHandler((req, res) => {
  const userId = req.body.user_id || req.user.id;
  const { type, year, make, model } = req.body;

  const SQL = `INSERT INTO user_vehicles (user_id, type, year, make, model) VALUES (?, ?, ?, ?, ?)`;
  db.query(SQL, [userId, type, year, make, model], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error adding vehicle" });
    }

    res.status(201).json({
      message: "Vehicle added successfully",
    });
  });
});


// Retrieve a user's saved vehicles
const getAllVehicles = expressAsyncHandler((req, res) => {

  const SQL = `
    SELECT id, user_id, type, year, make, model, mileage, mileage_rate FROM user_vehicles
  `;
  db.query(SQL, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching all vehicles" });
    }

    res.json(results);
  });
});




// Retrieve a user's saved vehicles
const getUserVehicles = expressAsyncHandler((req, res) => {
  const userId = req.params.userId || req.user.id;

  const SQL = `
    SELECT id, user_id, type, year, make, model, mileage, mileage_rate FROM user_vehicles WHERE user_id = ?
  `;
  db.query(SQL, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching user vehicles" });
    }

    res.json(results);
  });
});

const getUserSpecificVehicle = expressAsyncHandler((req, res) => {
  const userId = req.body.user_id || req.user.id;
  const vehicleId = req.body.vehicleId;

  const SQL = `
    SELECT id, user_id, type, year, make, model, mileage, mileage_rate FROM user_vehicles WHERE user_id = ? AND id = ?
  `;
  db.query(SQL, [userId, vehicleId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching user vehicles" });
    }

    res.json(results);
  });
});

// Update vehicle mileage or mileage rate in the user's garage
const updateVehicleDetails = expressAsyncHandler((req, res) => {
  const { user_vehicle_id, mileage, mileage_rate } = req.body;
  //   console.log(req.body);
  let updateFields = [];
  let values = [];

  if (mileage) {
    updateFields.push("mileage = ?");
    values.push(mileage);
  }
  if (mileage_rate) {
    updateFields.push("mileage_rate = ?");
    values.push(mileage_rate);
  }

  const SQL = `UPDATE user_vehicles SET ${updateFields.join(
    ", "
  )} WHERE id = ?`;

  db.query(SQL, [...values, user_vehicle_id], (err) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error updating vehicle details" });
    }

    res.json({ message: "Vehicle details updated successfully" });
  });
});

// Remove a vehicle from the user's garage
const removeVehicleFromGarage = expressAsyncHandler((req, res) => {
  const user_vehicle_id = req.params.vehicleId;

  const SQL = `DELETE FROM user_vehicles WHERE id = ?`;
  db.query(SQL, [user_vehicle_id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error removing vehicle" });
    }
    res.json({ message: "Vehicle removed from garage" });
  });
});

module.exports = {
  searchVehicle,
  addVehicle,
  getAllVehicles,
  getUserVehicles,
  getUserSpecificVehicle,
  updateVehicleDetails,
  removeVehicleFromGarage,
};
