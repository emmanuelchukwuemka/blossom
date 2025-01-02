const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloudinaryName,
  api_key: process.env.cloudinaryAPI_KEY,
  api_secret: process.env.cloudinaryAPI_SECRET,
  secure: true,
});


// Utility to delete media by public IDs
const deleteMedia = async (media) => {
  if (!media) return;
  if (Array.isArray(media)) {
    for (const item of media) {
      await deleteFromCloudinary(item.public_id);
    }
  } else {
    await deleteFromCloudinary(media.public_id);
  }
};


const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error("Public ID is required for deletion");
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted file with public ID: ${publicId}`);
  } catch (error) {
    console.error(`Error deleting file with public ID: ${publicId}`, error);
    throw error; // Re-throw the error to handle it upstream
  }
};


module.exports = { deleteMedia, deleteFromCloudinary };
