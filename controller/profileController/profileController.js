const db = require('../../Database/db');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');

// Submit profile verification
const submitProfileVerification = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { document_type, document_url, notes } = req.body;

  // Check if already submitted
  const checkExistingQuery = `
    SELECT id FROM user_verification 
    WHERE user_id = ? AND status = 'pending'
  `;

  db.query(checkExistingQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error checking existing verification:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to submit verification'
      });
    }

    if (result.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification request already pending'
      });
    }

    const insertVerificationQuery = `
      INSERT INTO user_verification (
        user_id, document_type, document_url, status, notes, 
        created_at, updated_at
      ) VALUES (?, ?, ?, 'pending', ?, NOW(), NOW())
    `;

    db.query(insertVerificationQuery, [userId, document_type, document_url, notes], (err, result) => {
      if (err) {
        console.error('Error submitting verification:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to submit verification'
        });
      }

      res.status(201).json({
        status: 'success',
        message: 'Verification submitted successfully',
        data: {
          verificationId: result.insertId
        }
      });
    });
  });
});

// Get privacy settings
const getPrivacySettings = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;

  const privacyQuery = `
    SELECT up.setting_name, up.setting_value, up.description
    FROM user_privacy_settings up
    WHERE up.user_id = ?
  `;

  db.query(privacyQuery, [userId], (err, settings) => {
    if (err) {
      console.error('Error fetching privacy settings:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch privacy settings'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        privacySettings: settings
      }
    });
  });
});

// Update privacy settings
const updatePrivacySettings = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const settings = req.body.settings; // Array of {setting_name, setting_value}

  if (!settings || !Array.isArray(settings)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid settings format'
    });
  }

  // Process each setting
  const updatePromises = settings.map(setting => {
    return new Promise((resolve, reject) => {
      const upsertSettingQuery = `
        INSERT INTO user_privacy_settings (user_id, setting_name, setting_value, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)
      `;
      
      db.query(upsertSettingQuery, [userId, setting.setting_name, setting.setting_value], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  });

  Promise.all(updatePromises)
    .then(() => {
      res.status(200).json({
        status: 'success',
        message: 'Privacy settings updated successfully'
      });
    })
    .catch(err => {
      console.error('Error updating privacy settings:', err);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update privacy settings'
      });
    });
});

// Get user badges
const getUserBadges = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;

  const badgesQuery = `
    SELECT ub.badge_name, ub.description, ub.icon_url, ub.earned_at
    FROM user_badges ub
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `;

  db.query(badgesQuery, [userId], (err, badges) => {
    if (err) {
      console.error('Error fetching badges:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch badges'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        badges
      }
    });
  });
});

// Customize profile
const customizeProfile = expressAsyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { theme, layout, color_scheme, profile_visibility } = req.body;

  // Update user profile customization
  const updateCustomizationQuery = `
    INSERT INTO user_profile_customizations (
      user_id, theme, layout, color_scheme, profile_visibility, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE 
      theme = VALUES(theme), 
      layout = VALUES(layout), 
      color_scheme = VALUES(color_scheme), 
      profile_visibility = VALUES(profile_visibility), 
      updated_at = VALUES(updated_at)
  `;

  db.query(updateCustomizationQuery, [userId, theme, layout, color_scheme, profile_visibility], (err, result) => {
    if (err) {
      console.error('Error customizing profile:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to customize profile'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile customized successfully'
    });
  });
});

module.exports = {
  submitProfileVerification,
  getPrivacySettings,
  updatePrivacySettings,
  getUserBadges,
  customizeProfile
};