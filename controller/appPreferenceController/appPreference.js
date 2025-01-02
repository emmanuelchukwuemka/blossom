const db = require('../../Database/db');
const asyncHandler = require("express-async-handler");
const { getOrCreateAppPreference } = require("../../utils/defaultTables");

// PATCH request for updating app preferences with specific responses for each field
const updateAppPreference = asyncHandler(async (req, res) => {
    const { user_id, ...fieldsToUpdate } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    // Check if the user exists
    const userCheckQuery = 'SELECT id FROM users WHERE id = ?';
    db.query(userCheckQuery, [user_id], (err, userResults) => {
        if (err) {
            return res.status(500).json({ message: "Error checking user existence", error: err });
        }
        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure app_preference entry exists
        getOrCreateAppPreference(user_id).then(() => {
            const validAppPreferenceFields = [
                'allow_history', 'ads_privacy', 'image_quality', 'barcode_scanning_mode',
                'barcode_types', 'enable_flash', 'auto_focus', 'sound_notification',
                'vibration_notification', 'wifi_auto_play', 'is_shop_data_in_store_analytics'
            ];

            const updateMessages = {
                allow_history: value => `History tracking ${value ? "enabled" : "disabled"} successfully`,
                ads_privacy: value => `Ads privacy ${value ? "enabled" : "disabled"} successfully`,
                enable_flash: value => `Flash ${value ? "enabled" : "disabled"} successfully`,
                auto_focus: value => `Auto-focus ${value ? "enabled" : "disabled"} successfully`,
                sound_notification: value => `Sound notification ${value ? "enabled" : "disabled"} successfully`,
                vibration_notification: value => `Vibration notification ${value ? "enabled" : "disabled"} successfully`,
                wifi_auto_play: value => `WiFi auto-play ${value ? "enabled" : "disabled"} successfully`,
                is_shop_data_in_store_analytics: value => `Shop data in-store analytics ${value ? "enabled" : "disabled"} successfully`,
                image_quality: "Image quality updated successfully",
                barcode_scanning_mode: "Barcode scanning mode updated successfully",
                barcode_types: "Barcode types updated successfully",
            };

            const updates = Object.keys(fieldsToUpdate).filter(field => validAppPreferenceFields.includes(field));

            if (updates.length === 0) {
                return res.status(400).json({ message: "No valid app preference fields provided to update" });
            }

            if (fieldsToUpdate.barcode_types) {
                if (Array.isArray(fieldsToUpdate.barcode_types)) {
                    fieldsToUpdate.barcode_types = fieldsToUpdate.barcode_types
                        .filter(value => ['upc', 'qr-code', 'ean'].includes(value))
                        .join(',');
                }
            }

            let updateSQL = 'UPDATE app_preference SET ';
            updateSQL += updates.map(field => `${field} = ?`).join(', ') + ' WHERE user_id = ?';
            const values = updates.map(field => fieldsToUpdate[field]).concat(user_id);

            db.query(updateSQL, values, (error, result) => {
                if (error) {
                    console.error("Error updating app preferences:", error);
                    return res.status(500).json({ message: "Error updating app preferences" });
                }

                const responseMessages = updates.map(field => {
                    const message = updateMessages[field];
                    return typeof message === 'function' ? message(fieldsToUpdate[field]) : message;
                });

                return res.status(200).json({ messages: responseMessages[0] });
            });
        }).catch(err => {
            console.error("Error ensuring app preference entry:", err);
            return res.status(500).json({ message: "Error ensuring app preference entry", error: err });
        });
    });
});




// GET request for retrieving app preferences
const getUserAppPreference = asyncHandler(async (req, res) => {
    const user_id = req.params.userId || req.user.id;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }
    const appPreference = await getOrCreateAppPreference(user_id);

    if (!appPreference) {
        return res.status(404).json({ message: "User doesn't exist" });
    }
    if (appPreference.barcode_types) {
        appPreference.barcode_types = appPreference.barcode_types.split(',');
    } else if (appPreference.barcode_types === "") {
        appPreference.barcode_types = [];
    }
    const booleanFields = [
        'allow_history',
        'ads_privacy',
        'enable_flash',
        'auto_focus',
        'sound_notification',
        'vibration_notification',
        'wifi_auto_play',
        'is_shop_data_in_store_analytics'
    ];
    booleanFields.forEach(field => {
        appPreference[field] = Boolean(appPreference[field]);
    });
    return res.status(200).json({ appPreference });
});



// POST request to reset app preferences to default
const resetUserAppPreference = asyncHandler(async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "user_id is required" });
    }

    const resetSQL = `
        UPDATE app_preference 
        SET 
            allow_history = 1,
            ads_privacy = 1,
            image_quality = 'normal',
            barcode_scanning_mode = 'manual',
            barcode_types = 'qr-code',
            enable_flash = 1,
            auto_focus = 1,
            sound_notification = 1,
            vibration_notification = 1,
            wifi_auto_play = 1
        WHERE user_id = ?`;

    db.query(resetSQL, [user_id], (error, result) => {
        if (error) {
            console.error("Error resetting app preferences:", error);
            return res.status(500).json({ message: "Error resetting app preferences" });
        }
        return res.status(200).json({ message: "App preferences reset to default successfully" });
    });
});

module.exports = {
    updateAppPreference,
    getUserAppPreference,
    resetUserAppPreference,
};
