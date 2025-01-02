const expressAsyncHandler = require("express-async-handler");
const db = require("../../Database/db");
const { uploadToCloudinaryWithId } = require("../../utils/cloudinary/uploader");

const getReviews = expressAsyncHandler(async (req, res) => {
  const { type } = req.params; // "text", "image", "video"
  const reviewType = type || "text"; // Default to "text" if no type provided

  // SQL query with LEFT JOIN to fetch user details and include file information
  const SQL = `
    SELECT 
      gr.id, 
      gr.type, 
      gr.title, 
      gr.body, 
      gr.location, 
      gr.likes, 
      gr.dislikes, 
      gr.rating, 
      gr.file_id, 
      gr.file_url, 
      gr.created_at, 
      gr.updated_at, 
      u.name AS user_name, 
      u.avatar AS user_avatar 
    FROM 
      giftcard_reviews gr
    LEFT JOIN 
      users u ON gr.user_id = u.id
    WHERE 
      gr.type = ? 
    ORDER BY 
      gr.created_at DESC`;

  db.query(SQL, [reviewType], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching reviews" });
    }

    if(result.length<1){
      return res.status(401).json({ message: "No Reviews Found" });
    }
    // Map over the results and handle cases where user details are missing
    const reviews = result.map((review) => ({
      id: review.id,
      user_id: review.user_id,
      type: review.type,
      files: review.file_id
        ? review.file_id.split(",").map((id) => ({
            id,
            url: review.file_url.split(",")[
              review.file_id.split(",").indexOf(id)
            ],
          }))
        : null,
      title: review.title,
      body: review.body,
      likes: review.likes,
      dislikes: review.dislikes,
      rating: review.rating,
      user_name: review.user_name || "Unknown User", // Default value for missing user
      user_avatar: review.user_avatar || null, // Default to null if no avatar
      has_liked: review.like_user_ids
        ? review.like_user_ids.split(",").includes(String(userId))
        : false,
      has_disliked: review.dislike_user_ids
        ? review.dislike_user_ids.split(",").includes(String(userId))
        : false,
      created_at: review.created_at,
    }));

    return res.json(reviews);
  });
});




const likeDislikeReview = expressAsyncHandler(async (req, res) => {
  const { like_type, review_id } = req.body; // "likes" or "dislikes"
  const userId = req.user.id;

  if (!like_type || !review_id) {
    return res.status(400).json({ message: "Type and review ID are required" });
  }

  const isLike = like_type === "likes";
  const currentField = isLike ? "like_user_ids" : "dislike_user_ids";
  const oppositeField = isLike ? "dislike_user_ids" : "like_user_ids";

  // Fetch the current review
  const fetchSQL = `
    SELECT likes, dislikes, ${currentField}, ${oppositeField} 
    FROM giftcard_reviews 
    WHERE id = ?`;

  db.query(fetchSQL, [review_id], (fetchErr, fetchResult) => {
    if (fetchErr) {
      console.log(fetchErr);
      return res.status(500).json({ message: "Error fetching review" });
    }

    if (fetchResult.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = fetchResult[0];
    const currentIds = review[currentField]
      ? review[currentField].split(",").filter((id) => id)
      : [];
    const oppositeIds = review[oppositeField]
      ? review[oppositeField].split(",").filter((id) => id)
      : [];

    let likes = review.likes;
    let dislikes = review.dislikes;
    let updatedCurrentIds = [...currentIds];
    let updatedOppositeIds = [...oppositeIds];

    if (currentIds.includes(String(userId))) {
      // User is toggling off their current reaction
      updatedCurrentIds = currentIds.filter((id) => id !== String(userId));
      if (isLike) likes--;
      else dislikes--;
    } else {
      // User is toggling on a new reaction
      updatedCurrentIds.push(String(userId));
      if (isLike) likes++;
      else dislikes++;

      // Remove from the opposite reaction if present
      if (oppositeIds.includes(String(userId))) {
        updatedOppositeIds = oppositeIds.filter((id) => id !== String(userId));
        if (isLike) dislikes--;
        else likes--;
      }
    }

    // Update the review
    const updateSQL = `
      UPDATE giftcard_reviews
      SET 
        likes = ?, 
        dislikes = ?, 
        ${currentField} = ?, 
        ${oppositeField} = ?
      WHERE id = ?`;

    db.query(
      updateSQL,
      [
        likes,
        dislikes,
        updatedCurrentIds.join(","),
        updatedOppositeIds.join(","),
        review_id,
      ],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.log(updateErr);
          return res.status(500).json({ message: "Error updating review" });
        }

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ message: "Review not found" });
        }

        return res.json({
          message: "Review updated successfully",
          likes,
          dislikes,
          has_liked: updatedCurrentIds.includes(String(userId)) && isLike,
          has_disliked: updatedCurrentIds.includes(String(userId)) && !isLike,
        });
      }
    );
  });
});



const createReview = expressAsyncHandler(async (req, res) => {
  const userId = req.body.user_id || req.user.id;
  const type = req.body.type || req.params.type; // type: "text", "image", "video"
  const files = req.files;

  const { title, body, rating, location } = req.body;

  if (!title || !body || !rating || !location) {
    return res.status(400).json({ message: "Fill all the required fields" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  // if there are files, then upload
  let fileIds = [];
  let fileUrls = [];
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const cldRes = await uploadToCloudinaryWithId(
        files[i].buffer,
        files[i].mimetype
      );
      fileIds.push(cldRes.public_id);
      fileUrls.push(cldRes.secure_url);
    }
  }

  const SQL =
    "INSERT INTO giftcard_reviews (user_id, type, file_id, file_url, title, body, location, likes, dislikes, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    SQL,
    [
      userId,
      type,
      fileIds.join(","),
      fileUrls.join(","),
      title,
      body,
      location, // Pass location here
      0,
      0,
      rating,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error creating review" });
      }

      return res.json({ message: "Review created successfully" });
    }
  );
});


module.exports = {
  getReviews,
  likeDislikeReview,
  createReview,
};
