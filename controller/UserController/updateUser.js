const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const db = require('../../Database/db');
const cloudinary = require('cloudinary').v2;
const currentDate = require("../../utils/Date/currentDate");
cloudinary.config({
  cloud_name: process.env.cloudinaryName,
  api_key: process.env.cloudinaryAPI_KEY,
  api_secret: process.env.cloudinaryAPI_SECRET,
  secure: true,
});
const { uploadCloudinaryBase64, uploadToCloudinary } = require("../../utils/cloudinary/uploader")





// Update user
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.body.user_id || req.user.id; // Extract user ID from the request URL
    const { name, email, phone, passkey, password, two_step_verification_number, two_step_verification_code, two_step_verification } = req.body; // Extract fields from request body

    const SQL = 'SELECT * FROM users WHERE id = ?';
    db.query(SQL, [userId], async (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Something went wrong"
            });
        }

        if (result.length > 0) { // If user is found
            let updateFields = [];
            let values = [];

            // Conditionally update only the fields provided in the request body
            if (name) {
                updateFields.push("name = ?");
                values.push(name);
            }
            if (email) {
                updateFields.push("email = ?");
                values.push(email);
            }
            if (phone) {
                updateFields.push("phone = ?");
                values.push(phone);
            }
            if (passkey) {
              // Note that passkey is boolean, so no hashing
                updateFields.push("passkey = ?");
                values.push(passkey);
            }
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10); // Hash password
                updateFields.push("password = ?");
                values.push(hashedPassword);
            }
            if (two_step_verification_number) {
                updateFields.push("two_step_verification_number = ?");
                values.push(two_step_verification_number);
            }
            if (two_step_verification_code) {
                const hashedTwoStepCode = await bcrypt.hash(two_step_verification_code, 4); // Hash two-step code
                updateFields.push("two_step_verification_code = ?");
                values.push(hashedTwoStepCode);
            }
            if (two_step_verification !== undefined) {
                updateFields.push("two_step_verification = ?");
                values.push(two_step_verification);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ message: "No valid fields provided for update" });
            }

            values.push(userId); // Add userId at the end for the WHERE clause

            const updateSQL = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
            db.query(updateSQL, values, (err, updateResult) => {
                if (err) {
                    return res.status(500).json({
                        message: "Failed to update user"
                    });
                }

                res.status(200).json({
                    message: "User updated successfully",
                    user: {
                        id: userId,
                        ...(name && { name }),
                        ...(email && { email }),
                        ...(phone && { phone }),
                        ...(passkey && { passkey: "updated" }), // Indicating passkey has been updated
                        ...(password && { password: "updated" }), // Indicating password has been updated
                        ...(two_step_verification_code && { two_fa_success: "updated your two factor authentication successfully" }),
                    }
                });
            });
        } else {
            res.status(404).json({
                message: "User not found"
            });
        }
    });
});







const editProfile = asyncHandler(async (req, res) => {
  const { user_id, name, address, public_name, public_photo } = req.body;
  const SQL_FETCH_USER = 'SELECT * FROM users WHERE id = ?';
  db.query(SQL_FETCH_USER, [user_id], async (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch user details",
        error: err.message,
      });
    }
    const user = result[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let updateData = {
      ...(name && { name }),
      ...(address && { address }),
      ...(public_name && { public_name }),
    };
    if (public_photo) {
      try {
        if (user.public_photo_id) {
          await cloudinary.uploader.destroy(user.public_photo_id);
        }
const { url, public_id } = await uploadCloudinaryBase64(public_photo);
        updateData.public_photo_url = url;
        updateData.public_photo_id = public_id;

      } catch (error) {
        return res.status(500).json({
          message: "Failed to upload public photo to Cloudinary",
          error: error.message,
        });
      }
    }

    // Update the user record in the database
    const updateSQL = `UPDATE users SET ?, updated_at = ? WHERE id = ?`;
    const updateValues = [updateData, currentDate(), user_id];

    db.query(updateSQL, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update user profile",
          error: err.message,
        });
      }
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user_id,
          ...(name && { name }),
          ...(address && { address }),
          ...(public_name && { public_name }),
          ...(updateData.public_photo_url && { public_photo: updateData.public_photo_url }),
          ...(updateData.public_photo_id && { public_photo_id: updateData.public_photo_id }),
        },
      });
    });
  });
});



const updatePassword = asyncHandler(async (req, res) => {
  const { user_id, oldPassword, newPassword } = req.body;

  if (!user_id || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "user_id, oldPassword, and newPassword are required" });
  }

  const SQL = 'SELECT password FROM users WHERE id = ?';
  db.query(SQL, [user_id], async (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }

      const user = result[0];

      // Verify that oldPassword matches the current password
      const passwordMatches = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatches) {
          return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      const updateSQL = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
      db.query(updateSQL, [hashedNewPassword, user_id], (err, updateResult) => {
          if (err) {
              return res.status(500).json({
                  message: "Failed to update user password",
                  error: err.message
              });
          }

          res.status(200).json({ message: "Password updated successfully" });
      });
  });
});



const updateZipCode = asyncHandler(async (req, res) => {
  const { user_id, zip_code } = req.body;

  if (!user_id || !zip_code) {
    return res.status(400).json({ message: "user_id and zip_code are required" });
  }

  // Validate ZIP code format
  const zipCodeRegex = /^\d{6}$/;
  if (!zipCodeRegex.test(zip_code)) {
    return res.status(400).json({ message: "Invalid ZIP code format. Must be 6 digits." });
  }

  const SQL_FETCH_USER = 'SELECT is_elite FROM users WHERE id = ?';
  db.query(SQL_FETCH_USER, [user_id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch user details",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    // Check if user is an elite member
    if (!user.is_elite) {
      return res.status(201).json({ message: "Only Elite members can update their ZIP code." });
    }

    // Update ZIP code for the elite user
    const SQL_UPDATE_ZIP = 'UPDATE users SET zip_code = ?, updated_at = NOW() WHERE id = ?';
    db.query(SQL_UPDATE_ZIP, [zip_code, user_id], (err, updateResult) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update ZIP code",
          error: err.message,
        });
      }

      res.status(200).json({ message: "ZIP code updated successfully" });
    });
  });
});




module.exports = { updateUser, editProfile, updatePassword, updateZipCode };