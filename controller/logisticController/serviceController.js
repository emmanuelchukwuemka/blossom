const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { deleteMedia } = require("../../utils/cloudinary/deleter");
const { uploadToCloudinaryWithId } = require("../../utils/cloudinary/uploader");

// Service Controllers
const getAllServices = expressAsyncHandler(async (req, res) => {
  const SQL = "SELECT * FROM logistic_services";
  db.query(SQL, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching services" });

    const services = results.map((service) => ({
      ...service,
      images: service.images && service.images.startsWith('[') ? JSON.parse(service.images) : [service.images],
      video: service.video && service.video.startsWith('{') ? JSON.parse(service.video) : service.video,
    }));
    return res.json(services);
  });
});


const getServicesByCategory = expressAsyncHandler(async (req, res) => {
  const { category } = req.params;
  const SQL = "SELECT * FROM logistic_services WHERE category_name = ?";
  db.query(SQL, [category], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching services" });

    const services = results.map((service) => ({
      ...service,
      images: service.images ? JSON.parse(service.images) : [],
      video: service.video ? JSON.parse(service.video) : null,
    }));
    return res.json(services);
  });
});

const getService = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL = "SELECT * FROM logistic_services WHERE id = ?";
  db.query(SQL, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error fetching service" });
    if (result.length === 0)
      return res.status(404).json({ message: "Service not found" });

    const service = {
      ...result[0],
      images: result[0].images ? JSON.parse(result[0].images) : [],
      video: result[0].video ? JSON.parse(result[0].video) : null,
    };
    return res.json(service);
  });
});

const createService = expressAsyncHandler(async (req, res) => {
  const {
    logistic_supplier_id,
    name,
    description,
    category_name,
    min_price,
    max_price,
  } = req.body;

  const images = req.files?.images;
  const video = req.files?.video?.[0];

  if (!logistic_supplier_id || !name || !min_price || !max_price) {
    return res
      .status(400)
      .json({ message: "Supplier ID, name, and price range are required" });
  }

  let imageUploads = [];
  let videoUpload = null;

  if (images) {
    for (const image of images) {
      const uploadRes = await uploadToCloudinaryWithId(
        image.buffer,
        image.mimetype,
        "logistic_services/images"
      );
      imageUploads.push({
        public_id: uploadRes.public_id,
        url: uploadRes.secure_url,
      });
    }
  }

  if (video) {
    const uploadRes = await uploadToCloudinaryWithId(
      video.buffer,
      video.mimetype,
      "logistic_services/videos"
    );
    videoUpload = { public_id: uploadRes.public_id, url: uploadRes.secure_url };
  }

  const SQL = `INSERT INTO logistic_services 
    (logistic_supplier_id, name, description, category_name, min_price, max_price, images, video) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    SQL,
    [
      logistic_supplier_id,
      name,
      description,
      category_name,
      min_price,
      max_price,
      imageUploads.length ? JSON.stringify(imageUploads) : null,
      videoUpload ? JSON.stringify(videoUpload) : null,
    ],
    (err) => {
      if (err)
        return res.status(500).json({ message: "Error creating service" });
      return res.status(201).json({ message: "Service created successfully" });
    }
  );
});

const updateService = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const existingServiceSQL =
    "SELECT images, video FROM logistic_services WHERE id = ?";
  db.query(existingServiceSQL, [id], async (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching service" });
    if (results.length === 0)
      return res.status(404).json({ message: "Service not found" });

    const existingMedia = results[0];

    if (req.files?.images || req.files?.video) {
      await deleteMedia(
        existingMedia.images ? JSON.parse(existingMedia.images) : null
      );
      await deleteMedia(
        existingMedia.video ? JSON.parse(existingMedia.video) : null
      );
    }

    const images = req.files?.images;
    const video = req.files?.video?.[0];
    let imageUploads = [];
    let videoUpload = null;

    if (images) {
      for (const image of images) {
        const uploadRes = await uploadToCloudinaryWithId(
          image.buffer,
          image.mimetype,
          "logistic_services/images"
        );
        imageUploads.push({
          public_id: uploadRes.public_id,
          url: uploadRes.secure_url,
        });
      }
    }

    if (video) {
      const uploadRes = await uploadToCloudinaryWithId(
        video.buffer,
        video.mimetype,
        "logistic_services/videos"
      );
      videoUpload = {
        public_id: uploadRes.public_id,
        url: uploadRes.secure_url,
      };
    }

    updates.images = imageUploads.length ? JSON.stringify(imageUploads) : null;
    updates.video = videoUpload ? JSON.stringify(videoUpload) : null;

    const updateSQL = "UPDATE logistic_services SET ? WHERE id = ?";
    db.query(updateSQL, [updates, id], (err) => {
      if (err)
        return res.status(500).json({ message: "Error updating service" });
      return res.json({ message: "Service updated successfully" });
    });
  });
});

const deleteService = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const fetchSQL = "SELECT images, video FROM logistic_services WHERE id = ?";
  db.query(fetchSQL, [id], async (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching service" });
    if (results.length === 0)
      return res.status(404).json({ message: "Service not found" });

    const service = results[0];
    await deleteMedia(service.images ? JSON.parse(service.images) : null);
    await deleteMedia(service.video ? JSON.parse(service.video) : null);

    const deleteSQL = "DELETE FROM logistic_services WHERE id = ?";
    db.query(deleteSQL, [id], (err) => {
      if (err)
        return res.status(500).json({ message: "Error deleting service" });
      return res.json({ message: "Service deleted successfully" });
    });
  });
});

// Review Controllers
const getReviews = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL =
    "SELECT * FROM logistic_service_reviews WHERE logistic_service_id = ?";
  db.query(SQL, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching reviews" });
    return res.json(results);
  });
});

const createReview = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewer_id, rating, review } = req.body;
  if (!reviewer_id || !rating || !review) {
    return res
      .status(400)
      .json({ message: "Reviewer ID, rating, and review are required" });
  }
  const SQL =
    "INSERT INTO logistic_service_reviews (logistic_service_id, reviewer_id, rating, review) VALUES (?, ?, ?, ?)";
  db.query(SQL, [id, reviewer_id, rating, review], (err) => {
    if (err) return res.status(500).json({ message: "Error creating review" });
    return res.status(201).json({ message: "Review created successfully" });
  });
});

const updateReview = expressAsyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const updates = req.body;
  const SQL = "UPDATE logistic_service_reviews SET ? WHERE id = ?";
  db.query(SQL, [updates, reviewId], (err) => {
    if (err) return res.status(500).json({ message: "Error updating review" });
    return res.json({ message: "Review updated successfully" });
  });
});

const deleteReview = expressAsyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const SQL = "DELETE FROM logistic_service_reviews WHERE id = ?";
  db.query(SQL, [reviewId], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting review" });
    return res.json({ message: "Review deleted successfully" });
  });
});

module.exports = {
  getAllServices,
  getServicesByCategory,
  getService,
  createService,
  updateService,
  deleteService,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
