const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const db = require('../../Database/db');
const sendEmail = require('../../utils/sendEmail');
const { uploadCloudinaryBase64Raw } = require("../../utils/cloudinary/uploader");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.cloudinaryName,
    api_key: process.env.cloudinaryAPI_KEY,
    api_secret: process.env.cloudinaryAPI_SECRET,
    secure: true,
  });


// Business Account Creation (Registration)
const registerBusiness = asyncHandler(async (req, res) => {
    const { user_id, business_full_name, business_email, business_password } = req.body;

    // Validation
    if (!business_full_name || !business_email || !business_password) {
        return res.status(400).json({ message: "Please fill in all the required fields." });
    }

    if (business_password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check if user_id exists
    const checkUserSQL = `SELECT id from Users WHERE id = ?`;
    db.query(checkUserSQL, [user_id], (err, userResult) => {
        if (err) {
            console.error("Database error during user ID check:", err);
            return res.status(500).json({ message: "Database error during user ID check" });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: "User ID not found. Please register a user account first." });
        }

        // Check if the email already exists in the business account
        const q = 'SELECT * FROM business_account WHERE business_email = ?';
        db.query(q, [business_email], async (err, existingBusiness) => {
            if (err) {
                console.error("Database error during email check:", err);
                return res.status(500).json({ message: "Database error during email check" });
            }

            if (existingBusiness.length > 0 && existingBusiness[0].is_business_otp_verify === 0) {
                return res.status(200).json({ message: "Business account already exists, please verify your email" });
            }
            if (existingBusiness.length > 0 && existingBusiness[0].is_business_otp_verify === 1) {
                return res.status(200).json({ message: "Business account already exists, proceed to login" });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(business_password, 10);

            // Generate OTP
            const otpCode = crypto.randomInt(1000, 9999);

            // Insert the new business account
            const insertSQL = `
                INSERT INTO business_account (user_id, business_full_name, business_email, business_password, business_email_otp, is_business_otp_verify) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(insertSQL, [user_id, business_full_name, business_email, hashedPassword, otpCode, false], async (err, result) => {
                if (err) {
                    console.error("Detailed MySQL error:", err); // Log the actual database error
                    return res.status(500).json({ message: "Database error while inserting business account", error: err.message });
                }

                // Send OTP email
                const html = `<p>
                    <h3>Business Account Successfully Registered</h3>
                    <h4>Your OTP code is ${otpCode}</h4>
                    <br/><br/><br/>
                    <h4>Dear ${business_full_name},</h4>
                    <p>Congratulations on successfully creating a business account with us. To verify your account, use the code: ${otpCode}. If you did not register, please ignore this email.</p>
                </p>`;
                
                await sendEmail({
                    to: business_email,
                    subject: 'Verify Your Business Account', 
                    html });

                res.status(201).json({ message: 'Business account created, OTP sent to email' });
            });
        });
    });
});


// Verify OTP for Business Account
const verifyBusinessOtp = asyncHandler(async (req, res) => {
    const { business_email, otp_code } = req.body;

    // Validation
    if (!business_email || !otp_code) {
        return res.status(400).json({ message: 'Please provide email and OTP code' });
    }

    // Check if the email and OTP exist
    const q = 'SELECT * FROM business_account WHERE business_email = ?';
    db.query(q, [business_email], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        const businessAccount = result[0];
        if (!businessAccount) {
            return res.status(404).json({ message: 'Business account not found' });
        }

        if (businessAccount.is_business_otp_verify) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (businessAccount.business_email_otp === otp_code) {
            // Mark email as verified
            const updateQuery = 'UPDATE business_account SET is_business_otp_verify = true WHERE business_email = ?';
            db.query(updateQuery, [business_email], async (err, result) => {
                if (err) return res.status(500).json({ message: 'Error verifying OTP' });

            // Send OTP email
            const html = `<p>
            <h3>Business Account OTP verified Successfully</h3>
            <h4>Your new Business Account for ${business_email} is successfully verified</h4>
            <br/>
            <br/>
            <br/>
            <h4>Dear ${businessAccount.business_full_name},</h4>
            <br/>
            <p>Your Email for your business account has been verified successfully, proceed to add your informations to the account so that you will begin using the platform with an approved account.
            </p>
            </p>`;
                        // Send OTP email
                        await sendEmail({
                            to: business_email,
                            subject: 'Successful Email OTP verification', 
                            html});

                res.status(200).json({ message: 'OTP verified successfully' });
            });
        } else {
            res.status(400).json({ message: 'Invalid OTP code' });
        }
    });
});

// Resend OTP for Business Account
const resendBusinessOtp = asyncHandler(async (req, res) => {
    const { business_email } = req.body;

    // Validation
    if (!business_email) {
        return res.status(400).json({ message: 'Please provide email' });
    }

    const q = 'SELECT * FROM business_account WHERE business_email = ?';
    db.query(q, [business_email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        const businessAccount = result[0];
        if (!businessAccount) {
            return res.status(404).json({ message: 'Business account not found' });
        }

        if (businessAccount.is_business_otp_verify) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate new OTP
        const newOtp = crypto.randomInt(1000, 9999);

        // Update OTP in the database
        const updateQuery = 'UPDATE business_account SET business_email_otp = ? WHERE business_email = ?';
        db.query(updateQuery, [newOtp, business_email], async (err) => {
            if (err) return res.status(500).json({ message: 'Error resending OTP' });

            // Send OTP email
            const html = `<p>
            <h3>Business Account OTP resent Successfully</h3>
            <h4>Your new OTP code is ${newOtp}</h4>
            <br/>
            <br/>
            <br/>
            <h4>Dear ${businessAccount.business_full_name},</h4>
            <br/>
            <p>Your Email verification OTP for your business account has been resent successfully for verifying your account with us, just a few more steps to go to begin using your account. use this  code to verify your account, Your OTP code is ${newOtp}, use this code to verify your account and if it was not you that requested for this new OTP the account, kindly ignore.
            </p>
            </p>`;
                        // Send OTP email
                        await sendEmail({
                            to: business_email,
                            subject: 'Resend OTP for Business Account', 
                            html});

            res.status(200).json({ message: 'OTP resent successfully' });
        });
    });
});

// Business Login
const loginBusiness = asyncHandler(async (req, res) => {
    const { business_email, business_password } = req.body;

    // Validation
    if (!business_email || !business_password) {
        return res.status(400).json({ message: "Please enter email and password" });
    }

    const q = 'SELECT * FROM business_account WHERE business_email = ?';
    db.query(q, [business_email], async (err, business) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!business[0]) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check if email is verified
        if (!business[0].is_business_otp_verify) {
            return res.status(400).json({ message: 'Please verify your email before login' });
        }

        // Check password
        const isMatch = await bcrypt.compare(business_password, business[0].business_password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login to business account successful",
            data: business
        });
    });
});
const updateBusinessProfile = asyncHandler(async (req, res) => {
    const {
      business_email,
      business_full_name,
      business_phone,
      is_business_recieve_text,
      business_name,
      business_type,
      business_street_address,
      business_address,
      business_city,
      business_state,
      business_zip_code,
      business_document_file,
      business_employment_confirm_file,
      business_credit_card_name,
      business_credit_card_number,
      business_card_expire_date,
      business_id_number,
      business_id_type,
      business_invite_code,
      business_website,
    } = req.body;
  
    // Find the business account by business_email
    const businessQuery = 'SELECT * FROM business_account WHERE business_email = ?';
    db.query(businessQuery, [business_email], async (err, result) => {
      if (err) {
        console.error('Database error while fetching business account:', err);
        return res.status(500).json({ message: 'Database error while fetching business account' });
      }
  
      const business = result[0];
      if (!business) return res.status(404).json({ message: 'Business account not found' });
  
      let updateData = {
        ...(business_full_name && { business_full_name }),
        ...(business_phone && { business_phone }),
        ...(is_business_recieve_text !== undefined && { is_business_recieve_text }), // Accept boolean directly
        ...(business_name && { business_name }),
        ...(business_type && { business_type }),
        ...(business_street_address && { business_street_address }),
        ...(business_address && { business_address }),
        ...(business_city && { business_city }),
        ...(business_state && { business_state }),
        ...(business_zip_code && { business_zip_code }),
        ...(business_credit_card_name && { business_credit_card_name }),
        ...(business_credit_card_number && { business_credit_card_number }),
        ...(business_card_expire_date && { business_card_expire_date }),
        ...(business_id_number && { business_id_number }),
        ...(business_id_type && { business_id_type }),
        ...(business_invite_code && { business_invite_code }),
        ...(business_website && { business_website }),
      };
  
      // Handle business_document_file if provided
      if (business_document_file) {
        try {
          // Check if an existing document file exists, and delete it
          if (business.business_document_file_id) {
            await cloudinary.uploader.destroy(business.business_document_file_id);
          }
  
          // Upload new document file to Cloudinary
          const { url, public_id } = await uploadCloudinaryBase64Raw(business_document_file);
          updateData.business_document_file = url;
          updateData.business_document_file_id = public_id;
        } catch (error) {
          console.error('Error uploading business document file:', error);  // Log error for Cloudinary
          return res.status(500).json({ message: 'Error uploading business document file' });
        }
      }
  
      // Handle business_employment_confirm_file if provided
      if (business_employment_confirm_file) {
        try {
          // Check if an existing employment confirm file exists, and delete it
          if (business.business_employment_confirm_file_id) {
            await cloudinary.uploader.destroy(business.business_employment_confirm_file_id);
          }
  
          // Upload new employment confirm file to Cloudinary
          const { url, public_id } = await uploadCloudinaryBase64Raw(business_employment_confirm_file);
          updateData.business_employment_confirm_file = url;
          updateData.business_employment_confirm_file_id = public_id;
        } catch (error) {
          console.error('Error uploading employment confirmation file:', error);  // Log error for Cloudinary
          return res.status(500).json({ message: 'Error uploading employment confirmation file' });
        }
      }
  
      // Update the business account with the new data using business_email as the identifier
      const updateQuery = `UPDATE business_account SET ? WHERE business_email = ?`;
      db.query(updateQuery, [updateData, business_email], (err) => {
        if (err) {
          console.error('Error updating profile:', err);  // Log error for MySQL update
          return res.status(500).json({ message: 'Error updating profile', error: err.message });
        }
  
        res.status(200).json({
          message: 'Profile updated successfully',
          business: { ...business, ...updateData },
        });
      });
    });
});


// Get Business Account Details
const getAllBusinessAccountDetails = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    const q = 'SELECT * FROM business_account WHERE user_id = ?';
    db.query(q, [user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        const business = result;
        if (!business) return res.status(404).json({ message: 'Business accounts belonging to this user not found' });

        res.status(200).json({ message: "Business accounts retrieved successfully", businessAccounts: business });
    });
});




// Get Business Account Details
const getSingleBusinessAccountDetails = asyncHandler(async (req, res) => {
    const { business_email } = req.params; // Use req.query to accept either user_id or business_email

    // Validation
    if (!business_email) {
        return res.status(400).json({ message: 'Please provide the business_email' });
    }

    const q = 'SELECT * FROM business_account WHERE business_email = ?';

    // Execute the query
    db.query(q, [business_email], async (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Business account not found' });
        }

        // Return the result (either multiple accounts or a single account)
        res.status(200).json({ message: "Business account retrieved successfully", businessAccount: result[0] });
    });
});



// Test OTP Email
const testMail = asyncHandler(async (req, res) => {
    const { test_email } = req.body; // Use req.query to accept either user_id or business_email

    // Validation
    if (!test_email) {
        return res.status(400).json({ message: 'Please provide a test email, necessary to test the email service' });
    }
    await sendEmail({
        to: test_email, 
        subject: 'Testing the Email Service', 
        html: `<h1>The Email service has been successfully tested ${"1234"}</h1>`});
    res.status(200).json({ message: 'mail successfully sent' });
});




module.exports = {
    registerBusiness,
    verifyBusinessOtp,
    resendBusinessOtp,
    loginBusiness,
    updateBusinessProfile,
    getAllBusinessAccountDetails,
    getSingleBusinessAccountDetails,
    testMail
};
