const db = require("../Database/db");

// Utility function to get or create app_preference for a user
const getOrCreateAppPreference = async (userId) => {
  return new Promise((resolve, reject) => {
    const checkSQL = `SELECT * FROM app_preference WHERE user_id = ?`;
    db.query(checkSQL, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) {
        return resolve(results[0]);
      }
      const insertSQL = `
        INSERT INTO app_preference 
        (user_id, allow_history, ads_privacy, image_quality, barcode_scanning_mode, barcode_types, enable_flash, auto_focus, is_shop_data_in_store_analytics, sound_notification, vibration_notification, wifi_auto_play)
        VALUES (?, 1, 1, 'normal', 'manual', 'qr-code', 1, 1, 1, 1, 1, 1)
      `;
      db.query(insertSQL, [userId], (insertErr, insertResult) => {
        if (insertErr) return reject(insertErr);
        db.query(checkSQL, [userId], (fetchErr, newResults) => {
          if (fetchErr) return reject(fetchErr);
          resolve(newResults[0]);
        });
      });
    });
  });
};

// Utility function to get or create notifications for a user
const getOrCreateNotifications = async (userId) => {
  return new Promise((resolve, reject) => {
    const checkSQL = `SELECT * FROM notifications WHERE user_id = ?`;
    db.query(checkSQL, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) {
        return resolve(results[0]);
      }
      const insertSQL = `
        INSERT INTO notifications 
        (user_id, promotion_notification_receive, promotion_preferred_channel, promotion_frequency, promotion_exclusive_deals, promotion_early_access, promotion_notify_sound, promotion_subscribed, activity_order_placed, activity_order_shipped, activity_delivery_updates, activity_product_review, activity_wishlist_activity, activity_special_events, activity_rewards_points, activity_notify_sound, activity_subscribed, cartproduct_frequency, cartproduct_specific_remind, cartproduct_discount, cartproduct_notify_sound, cartproduct_pause_reminder, cartproduct_subscribed, inquiry_notify, inquiry_quick_response, inquiry_notify_sound, inquiry_subscribed)
        VALUES (?, FALSE, 'email', 'weekly', FALSE, FALSE, 'default', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 'default', FALSE, 'weekly', FALSE, FALSE, 'default', FALSE, FALSE, FALSE, FALSE, 'default', FALSE)
      `;
      db.query(insertSQL, [userId], (insertErr, insertResult) => {
        if (insertErr) return reject(insertErr);
        db.query(checkSQL, [userId], (fetchErr, newResults) => {
          if (fetchErr) return reject(fetchErr);
          resolve(newResults[0]);
        });
      });
    });
  });
};

// Utility function to get or create wallet for a user
const getOrCreateWallet = async (userId) => {
  return new Promise((resolve, reject) => {
    const checkSQL = `SELECT * FROM wallet WHERE user_id = ?`;
    db.query(checkSQL, [userId], (err, results) => {
      if (err) return reject(err);
      if (results.length > 0) {
        return resolve(results[0]);
      }
      const insertSQL = `
        INSERT INTO wallet 
        (user_id, balance, coin_balance, giftcard_balance, created_at, updatedAt)
        VALUES (?, 0, 0, 0, NOW(), NOW())
      `;
      db.query(insertSQL, [userId], (insertErr, insertResult) => {
        if (insertErr) return reject(insertErr);
        db.query(checkSQL, [userId], (fetchErr, newResults) => {
          if (fetchErr) return reject(fetchErr);
          resolve(newResults[0]);
        });
      });
    });
  });
};



module.exports = {
  getOrCreateAppPreference,
  getOrCreateNotifications,
  getOrCreateWallet,
};
