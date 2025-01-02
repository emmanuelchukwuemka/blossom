const db = require('../../Database/db');
const asyncHandler = require("express-async-handler");
const currentDate = require("../../utils/Date/currentDate");
const { sendEmail } = require("../../utils/sendEmail");
const { getOrCreateNotifications } = require("../../utils/defaultTables");


// PATCH requests for promotion
const promotion = asyncHandler(async (req, res) => {
    const { user_id, ...fieldsToUpdate } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Ensure notifications table entry exists
    await getOrCreateNotifications(user_id);

    const validPromotionFields = [
        'promotion_preferred_channel', 'promotion_frequency', 'promotion_exclusive_deals',
        'promotion_early_access', 'promotion_notify_sound', 'promotion_subscribed',
        'promotion_notification_receive'
    ];

    const updates = Object.keys(fieldsToUpdate).filter(field => validPromotionFields.includes(field));

    if (updates.length === 0) {
        return res.status(400).json({ message: "No valid promotion fields provided to update" });
    }

    if (fieldsToUpdate.promotion_preferred_channel) {
        if (Array.isArray(fieldsToUpdate.promotion_preferred_channel)) {
            fieldsToUpdate.promotion_preferred_channel = fieldsToUpdate.promotion_preferred_channel
                .filter(value => ['email', 'SMS', 'push'].includes(value))
                .join(',');
        }
    }

    let updateSQL = 'UPDATE notifications SET ';
    updateSQL += updates.map(field => `${field} = ?`).join(', ') + ' WHERE user_id = ?';

    const values = updates.map(field => fieldsToUpdate[field]).concat(user_id);

    db.query(updateSQL, values, (error, result) => {
        if (error) {
            console.error("Error updating promotion settings:", error);
            return res.status(500).json({ message: "Error updating promotion settings" });
        }
        return res.status(200).json({ message: "Promotion settings updated successfully" });
    });
});


// PATCH requests for activities
const activities = asyncHandler(async (req, res) => {
    const { user_id, ...fieldsToUpdate } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Ensure notifications table entry exists
    await getOrCreateNotifications(user_id);

    const validActivityFields = [
        'activity_order_placed', 'activity_order_shipped', 'activity_delivery_updates',
        'activity_product_review', 'activity_wishlist_activity', 'activity_special_events',
        'activity_rewards_points', 'activity_notify_sound', 'activity_subscribed'
    ];

    const updates = Object.keys(fieldsToUpdate).filter(field => validActivityFields.includes(field));

    if (updates.length === 0) {
        return res.status(400).json({ message: "No valid activity fields provided to update" });
    }

    let updateSQL = 'UPDATE notifications SET ';
    updateSQL += updates.map(field => `${field} = ?`).join(', ') + ' WHERE user_id = ?';

    const values = updates.map(field => fieldsToUpdate[field]).concat(user_id);

    db.query(updateSQL, values, (error, result) => {
        if (error) {
            console.error("Error updating activity settings:", error);
            return res.status(500).json({ message: "Error updating activity settings" });
        }
        return res.status(200).json({ message: "Activity settings updated successfully" });
    });
});

// PATCH requests for cartproducts
const cartproducts = asyncHandler(async (req, res) => {
    const { user_id, ...fieldsToUpdate } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Ensure notifications table entry exists
    await getOrCreateNotifications(user_id);

    const validCartproductFields = [
        'cartproduct_frequency', 'cartproduct_specific_remind', 'cartproduct_discount',
        'cartproduct_notify_sound', 'cartproduct_pause_reminder', 'cartproduct_subscribed'
    ];

    const updates = Object.keys(fieldsToUpdate).filter(field => validCartproductFields.includes(field));

    if (updates.length === 0) {
        return res.status(400).json({ message: "No valid cartproduct fields provided to update" });
    }

    let updateSQL = 'UPDATE notifications SET ';
    updateSQL += updates.map(field => `${field} = ?`).join(', ') + ' WHERE user_id = ?';

    const values = updates.map(field => fieldsToUpdate[field]).concat(user_id);

    db.query(updateSQL, values, (error, result) => {
        if (error) {
            console.error("Error updating cartproduct settings:", error);
            return res.status(500).json({ message: "Error updating cartproduct settings" });
        }
        return res.status(200).json({ message: "Cartproduct settings updated successfully" });
    });
});

// PATCH requests for inquiry
const inquiry = asyncHandler(async (req, res) => {
    const { user_id, ...fieldsToUpdate } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Ensure notifications table entry exists
    await getOrCreateNotifications(user_id);

    const validInquiryFields = [
        'inquiry_notify', 'inquiry_quick_response', 'inquiry_notify_sound', 'inquiry_subscribed'
    ];

    const updates = Object.keys(fieldsToUpdate).filter(field => validInquiryFields.includes(field));

    if (updates.length === 0) {
        return res.status(400).json({ message: "No valid inquiry fields provided to update" });
    }

    let updateSQL = 'UPDATE notifications SET ';
    updateSQL += updates.map(field => `${field} = ?`).join(', ') + ' WHERE user_id = ?';

    const values = updates.map(field => fieldsToUpdate[field]).concat(user_id);

    db.query(updateSQL, values, (error, result) => {
        if (error) {
            console.error("Error updating inquiry settings:", error);
            return res.status(500).json({ message: "Error updating inquiry settings" });
        }
        return res.status(200).json({ message: "Inquiry settings updated successfully" });
    });
});



// POST request for getNotifications
const getNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Ensure notifications table entry exists
    const notificationSettings = await getOrCreateNotifications(userId);

    if (!notificationSettings) {
        return res.status(404).json({ message: "User doesn't exist" });
    }

    // Convert promotion_preferred_channel from a string to an array
    if (notificationSettings.promotion_preferred_channel) {
        notificationSettings.promotion_preferred_channel = notificationSettings.promotion_preferred_channel.split(',');
    } else if (notificationSettings.promotion_preferred_channel === "") {
        notificationSettings.promotion_preferred_channel = [];
    }

    // Convert numeric fields (0 and 1) to boolean (false and true)
    const booleanConvertedSettings = Object.fromEntries(
        Object.entries(notificationSettings).map(([key, value]) => {
            if (value === 0) return [key, false];
            if (value === 1) return [key, true];
            return [key, value]; // Leave non-boolean values unchanged
        })
    );

    return res.status(200).json({ notifications: booleanConvertedSettings });
});




// POST request for resetNotifications
const resetNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "user_id is required" });
    }

    const resetSQL = `
        UPDATE notifications 
        SET 
            promotion_notification_receive = FALSE,
            promotion_preferred_channel = 'email', promotion_frequency = 'weekly', promotion_exclusive_deals = FALSE,
            promotion_early_access = FALSE, promotion_notify_sound = 'default', promotion_subscribed = TRUE,
            activity_order_placed = FALSE, activity_order_shipped = FALSE, activity_delivery_updates = FALSE,
            activity_product_review = FALSE, activity_wishlist_activity = FALSE, activity_special_events = FALSE,
            activity_rewards_points = FALSE, activity_notify_sound = 'default', activity_subscribed = FALSE,
            cartproduct_frequency = 'weekly', cartproduct_specific_remind = FALSE, cartproduct_discount = FALSE,
            cartproduct_notify_sound = 'default', cartproduct_pause_reminder = FALSE, cartproduct_subscribed = FALSE,
            inquiry_notify = FALSE, inquiry_quick_response = FALSE, inquiry_notify_sound = 'default', inquiry_subscribed = FALSE
        WHERE user_id = ?`;

    db.query(resetSQL, [userId], (error, result) => {
        if (error) {
            console.error("Error resetting notifications:", error);
            return res.status(500).json({ message: "Error resetting notifications" });
        }
        return res.status(200).json({ message: "Notifications reset to default successfully" });
    });
});


// POST request for getNotifications
const testImagesUpload = asyncHandler(async (req, res) => {
    const files = req.files; // Files data
    const myBody = req.body
    const {image} = req.body
  
    // Log form fields and files separately
    // console.log('Form Fields:', myBody);
    console.log('Uploaded Files:', files);
  
    return res.status(200).json({ message: 'Endpoint tested successfully', data: { myBody, files } });
  });


module.exports = { getNotifications, resetNotifications, promotion, activities, cartproducts, inquiry, testImagesUpload };