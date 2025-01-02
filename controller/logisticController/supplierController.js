const expressAsyncHandler = require("express-async-handler");
const { uploadToCloudinaryWithId } = require("../../utils/cloudinary/uploader");
const db = require("../../Database/db");

// Supplier Controllers
const getAllSuppliers = expressAsyncHandler(async (req, res) => {
  const SQL = `
    SELECT 
      ls.*, 
      GROUP_CONCAT(lsrv.name) AS services
    FROM logistic_suppliers ls
    LEFT JOIN logistic_supplier_services lss ON ls.id = lss.logistic_supplier_id
    LEFT JOIN logistic_services lsrv ON lss.logistic_services_id = lsrv.id
    GROUP BY ls.id;
  `;
  db.query(SQL, (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching suppliers" });

    const suppliers = results.map((supplier) => ({
      ...supplier,
      images: supplier.images && supplier.images.startsWith('[') ? JSON.parse(supplier.images) : [supplier.images],
      video: supplier.video && supplier.video.startsWith('{') ? JSON.parse(supplier.video) : supplier.video,
      services: supplier.services ? supplier.services.split(",") : [],
    }));

    return res.json(suppliers);
  });
});


const getSupplier = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL = `
    SELECT 
      ls.*, 
      GROUP_CONCAT(lsrv.name) AS services
    FROM logistic_suppliers ls
    LEFT JOIN logistic_supplier_services lss ON ls.id = lss.logistic_supplier_id
    LEFT JOIN logistic_services lsrv ON lss.logistic_services_id = lsrv.id
    WHERE ls.id = ?
    GROUP BY ls.id;
  `;
  db.query(SQL, [id], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching supplier" });
    if (result.length === 0)
      return res.status(404).json({ message: "Supplier not found" });

    const supplier = {
      ...result[0],
      images: result[0].images ? JSON.parse(result[0].images) : [],
      video: result[0].video ? JSON.parse(result[0].video) : null,
      services: result[0].services ? result[0].services.split(",") : [],
    };

    return res.json(supplier);
  });
});


const createSupplier = expressAsyncHandler(async (req, res) => {
  const {
    name,
    location,
    description,
    country,
    staff,
    years_in_industry,
    years_exporting,
    is_verified,
    trace_raw_material,
    company_profile,
    our_advantages,
    total_transaction,
    total_output,
    avg_response_time,
    on_time_delivery,
    floor_space,
  } = req.body;

  console.log(req.body);

  const images = req.files?.images; // Assuming `images` is an array of files
  const video = req.files?.video?.[0]; // Assuming `video` is a single file

  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }

  // Upload files to Cloudinary and collect public IDs and URLs
  let imageUploads = [];
  let videoUpload = null;

  if (images) {
    for (const image of images) {
      const uploadRes = await uploadToCloudinaryWithId(
        image.buffer,
        image.mimetype,
        "logistics"
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
      "logistics"
    );
    videoUpload = { public_id: uploadRes.public_id, url: uploadRes.secure_url };
  }

  // Prepare fields for database insertion
  const fields = {
    name,
    location,
    description,
    country,
    staff,
    years_in_industry,
    years_exporting,
    is_verified,
    trace_raw_material,
    company_profile,
    our_advantages,
    total_transaction,
    total_output,
    avg_response_time,
    on_time_delivery,
    floor_space,
    images: imageUploads.length ? JSON.stringify(imageUploads) : null,
    video: videoUpload ? JSON.stringify(videoUpload) : null,
  };

  // Remove undefined or null values from fields
  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(
      ([_, value]) => value !== undefined && value !== null
    )
  );

  const fieldNames = Object.keys(filteredFields).join(", ");
  const fieldPlaceholders = Object.keys(filteredFields)
    .map(() => "?")
    .join(", ");
  const fieldValues = Object.values(filteredFields);

  const SQL = `INSERT INTO logistic_suppliers (${fieldNames}) VALUES (${fieldPlaceholders})`;

  db.query(SQL, fieldValues, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error creating supplier" });
    }
    return res.status(201).json({ message: "Supplier created successfully" });
  });
});

const updateSupplier = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  // Handle images and video fields
  if (updates.images) {
    updates.images = JSON.stringify(updates.images);
  }
  if (updates.video) {
    updates.video = JSON.stringify(updates.video);
  }

  const SQL = `UPDATE logistic_suppliers SET ? WHERE id = ?`;
  db.query(SQL, [updates, id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error updating supplier" });
    return res.json({ message: "Supplier updated successfully" });
  });
});

const deleteSupplier = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL = "DELETE FROM logistic_suppliers WHERE id = ?";
  db.query(SQL, [id], (err) => {
    if (err)
      return res.status(500).json({ message: "Error deleting supplier" });
    return res.json({ message: "Supplier deleted successfully" });
  });
});

// FAQ Controllers
const getAllFaqs = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL = "SELECT * FROM supplier_faqs WHERE supplier_id = ?";
  db.query(SQL, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching FAQs" });
    return res.json(results);
  });
});

const createFaq = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res
      .status(400)
      .json({ message: "Question and answer are required" });
  }
  const SQL =
    "INSERT INTO supplier_faqs (supplier_id, question, answer) VALUES (?, ?, ?)";
  db.query(SQL, [id, question, answer], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error creating FAQ" });
    }

    return res.status(201).json({ message: "FAQ created successfully" });
  });
});

const updateFaq = expressAsyncHandler(async (req, res) => {
  const { faqId } = req.params;
  const updates = req.body;
  const SQL = "UPDATE supplier_faqs SET ? WHERE id = ?";
  db.query(SQL, [updates, faqId], (err) => {
    if (err) return res.status(500).json({ message: "Error updating FAQ" });
    return res.json({ message: "FAQ updated successfully" });
  });
});

const deleteFaq = expressAsyncHandler(async (req, res) => {
  const { faqId } = req.params;
  const SQL = "DELETE FROM supplier_faqs WHERE id = ?";
  db.query(SQL, [faqId], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting FAQ" });
    return res.json({ message: "FAQ deleted successfully" });
  });
});


const addServiceToSupplier = expressAsyncHandler(async (req, res) => {
  const { supplierId, serviceId } = req.body;

  const SQL = `INSERT INTO logistic_supplier_services (logistic_supplier_id, logistic_services_id) VALUES (?, ?)`;
  db.query(SQL, [supplierId, serviceId], (err) => {
    if (err)
      return res.status(500).json({ message: "Error adding service to supplier" });
    return res.json({ message: "Service added to supplier successfully" });
  });
});

const removeServiceFromSupplier = expressAsyncHandler(async (req, res) => {
  const { supplierId, serviceId } = req.body;

  const SQL = `DELETE FROM logistic_supplier_services WHERE logistic_supplier_id = ? AND logistic_services_id = ?`;
  db.query(SQL, [supplierId, serviceId], (err) => {
    if (err)
      return res.status(500).json({ message: "Error removing service from supplier" });
    return res.json({ message: "Service removed from supplier successfully" });
  });
});


const getSupplierReviews = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const SQL = `
    SELECT * 
    FROM logistic_supplier_reviews 
    WHERE logistic_supplier_id = ?`;
  db.query(SQL, [id], (err, results) => {
    if (err)
      return res.status(500).json({ message: "Error fetching reviews" });
    return res.json(results);
  });
});

const createSupplierReview = expressAsyncHandler(async (req, res) => {
  const { supplierId, reviewer_id, rating, review } = req.body;
  const SQL = `
    INSERT INTO logistic_supplier_reviews (logistic_supplier_id, reviewer_id, rating, review) 
    VALUES (?, ?, ?, ?)`;
  db.query(SQL, [supplierId, reviewer_id, rating, review], (err) => {
    if (err)
      return res.status(500).json({ message: "Error creating review" });
    return res.status(201).json({ message: "Review created successfully" });
  });
});


const getSuppliersByServiceId = expressAsyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const SQL = `
    SELECT 
      ls.*, 
      GROUP_CONCAT(lsrv.name) AS services
    FROM logistic_suppliers ls
    LEFT JOIN logistic_supplier_services lss ON ls.id = lss.logistic_supplier_id
    LEFT JOIN logistic_services lsrv ON lss.logistic_services_id = lsrv.id
    WHERE lss.logistic_services_id = ?
    GROUP BY ls.id;
  `;

  db.query(SQL, [serviceId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching suppliers" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No suppliers found for this service" });
    }

    const suppliers = results.map((supplier) => ({
      ...supplier,
      images: supplier.images && supplier.images.startsWith('[') ? JSON.parse(supplier.images) : [supplier.images],
      video: supplier.video && supplier.video.startsWith('{') ? JSON.parse(supplier.video) : supplier.video,
      services: supplier.services ? supplier.services.split(",") : [],
    }));

    return res.json(suppliers);
  });
});

module.exports = {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  addServiceToSupplier,
  removeServiceFromSupplier,
  getSupplierReviews,
  createSupplierReview,
  getSuppliersByServiceId 
};
