const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloudinaryName,
  api_key: process.env.cloudinaryAPI_KEY,
  api_secret: process.env.cloudinaryAPI_SECRET,
  secure: true,
});

// Utility function to upload an image to Cloudinary
const uploadToCloudinary = async (fileBuffer, mimetype) => {
  const base64String = Buffer.from(fileBuffer).toString("base64");
  const dataURI = `data:${mimetype};base64,${base64String}`;
  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    resource_type: "auto",
  });
  return uploadResult.secure_url;
};

// Utility function to upload an image to Cloudinary
const uploadToCloudinaryWithId = async (
  fileBuffer,
  mimetype,
  folder = null
) => {
  const base64String = Buffer.from(fileBuffer).toString("base64");
  const dataURI = `data:${mimetype};base64,${base64String}`;
  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    folder,
    resource_type: "auto",
  });
  return {
    secure_url: uploadResult.secure_url,
    public_id: uploadResult.public_id,
  };
};

// Utility function to upload Base64 string or file to Cloudinary
const uploadCloudinaryBase64 = async (base64String, folder = "profile") => {
  try {
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: "image",
      width: 300,
      height: 300,
      crop: "scale",
    });
    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Cloudinary upload failed");
  }
};



// Utility function to upload Base64 string or file to Cloudinary
const uploadCloudinaryBase64Raw = async (base64String, folder = 'profile') => {
  try {
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
    });
    return {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Cloudinary upload failed');
  }
};

module.exports = {
  uploadToCloudinary,
  uploadToCloudinaryWithId,
  uploadCloudinaryBase64,
  uploadCloudinaryBase64Raw
};
