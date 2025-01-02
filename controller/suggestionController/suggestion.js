const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { uploadToCloudinaryWithId } = require("../../utils/cloudinary/uploader");
const { deleteFromCloudinary } = require("../../utils/cloudinary/deleter");

// Create a new suggestion
const makeSuggestion = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const files = req.files; // Array of files
  const { type, suggestion, email } = req.body;

console.log(req.body);
  if (!type || !suggestion || !email) {
    return res
      .status(400)
      .json({ message: "Type, suggestion, and email are required" });
  }

  let fileUrls = [];
  let fileIds = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const cldRes = await uploadToCloudinaryWithId(
        file.buffer,
        file.mimetype,
        "suggestions"
      );
      fileUrls.push(cldRes.secure_url);
      fileIds.push(cldRes.public_id);
    }
  }

  const SQL =
    "INSERT INTO suggestions (user_id, file_urls, file_ids, type, suggestion, email) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    SQL,
    [userId, JSON.stringify(fileUrls), JSON.stringify(fileIds), type, suggestion, email],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating suggestion" });
      }

      return res
        .status(200)
        .json({ message: "Suggestion created successfully" });
    }
  );
});

// Fetch user suggestions
const getSuggestions = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;

  const SQL = "SELECT * FROM suggestions WHERE user_id = ?";

  db.query(SQL, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching suggestions" });
    }

    return res.json(results);
  });
});



// Delete a suggestion
const deleteSuggestion = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // The ID of the suggestion to delete

  try {
    // Fetch the suggestion to retrieve `file_ids`
    const fetchSQL = "SELECT * FROM suggestions WHERE id = ?";
    db.query(fetchSQL, [id], async (err, results) => {
      if (err) {
        console.error("Database fetch error:", err);
        return res.status(500).json({ message: "Error fetching suggestion" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Suggestion not found" });
      }

      console.log("Fetched suggestion:", results[0]);

      const suggestion = results[0];
      let fileIds;

      try {
        // If `file_ids` is already an array, use it directly
        if (Array.isArray(suggestion.file_ids)) {
          fileIds = suggestion.file_ids;
        } else if (typeof suggestion.file_ids === "string") {
          // Parse `file_ids` as JSON if it's a string
          fileIds = JSON.parse(suggestion.file_ids);
        } else {
          throw new Error("file_ids is neither an array nor a valid JSON string");
        }
      } catch (parseErr) {
        console.error("Error parsing file_ids:", parseErr.message);
        return res.status(400).json({ message: "Invalid file_ids format in database" });
      }

      // Delete files from Cloudinary
      try {
        for (const fileId of fileIds) {
          const cloudResult = await deleteFromCloudinary(fileId);
          if (!cloudResult) {
            console.warn(`Failed to delete file: ${fileId}`);
          }
        }
      } catch (cloudErr) {
        console.error("Error deleting files from Cloudinary:", cloudErr);
        return res.status(500).json({ message: "Error deleting files from Cloudinary" });
      }

      // Delete the suggestion record from the database
      const deleteSQL = "DELETE FROM suggestions WHERE id = ?";
      db.query(deleteSQL, [id], (err) => {
        if (err) {
          console.error("Database deletion error:", err);
          return res.status(500).json({ message: "Error deleting suggestion" });
        }

        return res.status(200).json({ message: "Suggestion deleted successfully" });
      });
    });
  } catch (mainErr) {
    console.error("Unexpected error:", mainErr.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
});





module.exports = { makeSuggestion, getSuggestions, deleteSuggestion };
