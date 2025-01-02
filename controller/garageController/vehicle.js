const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const {
  uploadCloudinaryBase64,
  uploadToCloudinaryWithId,
} = require("../../utils/cloudinary/uploader");

const getVehicleCategories = expressAsyncHandler(async (req, res) => {
  const SQL =
    "SELECT id, name, description, image, image_id, created_at, updated_at FROM vehicle_categories";

  db.query(SQL, (err, result) => {
    if (err) {
      console.error("Database error:", err); // Log detailed error for debugging
      return res
        .status(500)
        .json({ message: "Error fetching vehicle categories", error: err.message });
    }

    // Send success response
    res.status(200).json({
      message: "Vehicle categories fetched successfully",
      categories: result,
    });
  });
});


const getVehiclesAccessories = expressAsyncHandler(async (req, res) => {
  const category_id = req.params.categoryId;

  const SQL =
    "SELECT id, name, description, amount, image, quantity, created_at, vehicle_category_id FROM vehicle_accessories WHERE vehicle_category_id = ?";
  db.query(SQL, [category_id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error fetching vehicle accessories" });
    }
    res.json(result);
  });
});

const searchVehicleAccessories = expressAsyncHandler((req, res) => {
  const keyword = req.body.keyword;

  const SQL = `
    SELECT id, name, description, image, created_at, amount, vehicle_category_id
    FROM vehicle_accessories
    WHERE name LIKE ? OR description LIKE ?
    `;
  db.query(SQL, [`%${keyword}%`, `%${keyword}%`], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error searching for vehicles" });
    }
    res.json(results);
  });
});

//
const createVehicleCategory = expressAsyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const image = req.body.image;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });
  }

  let imageUrl = null;
  let imageId = null;
  if (image) {
    const cldRes = await uploadCloudinaryBase64(image, "vehicleCategory");
    imageUrl = cldRes.url;
    imageId = cldRes.public_id;
    console.log(cldRes);
  }

  const SQL =
    "INSERT INTO vehicle_categories (name, description, image, image_id) VALUES (?, ?,  ?, ?)";

  db.query(SQL, [name, description, imageUrl, imageId], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Error creating vehicle category" });
    }
    res.status(201).json({ message: "Vehicle category created successfully" });
  });
});

const createVehicleAccessory = expressAsyncHandler(async (req, res) => {
  const { name, description, amount, quantity, vehicle_category_id } = req.body;
  const images = req.files;
  // console.log(images);
  // return;

  if (!name || !description || !amount || !quantity || !vehicle_category_id) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields" });
  }

  let imageUrls = [];
  let imageIds = [];
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const cldRes = await uploadToCloudinaryWithId(
        images[i].buffer,
        images[i].mimetype
      );
      imageUrls.push(cldRes.secure_url);
      imageIds.push(cldRes.public_id);
    }
  }

  const SQL =
    "INSERT INTO vehicle_accessories (name, description, amount, image, image_id, quantity, vehicle_category_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    SQL,
    [
      name,
      description,
      amount,
      imageUrls.join(","),
      imageIds.join(","),
      quantity,
      vehicle_category_id,
    ],

    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error creating vehicle accessory" });
      }
      res
        .status(201)
        .json({ message: "Vehicle accessory created successfully" });
    }
  );
});

module.exports = {
  getVehicleCategories,
  getVehiclesAccessories,
  searchVehicleAccessories,
  createVehicleCategory,
  createVehicleAccessory,
};
