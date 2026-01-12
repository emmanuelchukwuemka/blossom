-- Create user_privacy_settings table for privacy controls
CREATE TABLE IF NOT EXISTS user_privacy_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    setting_name VARCHAR(100) NOT NULL,
    setting_value VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_setting (user_id, setting_name),
    INDEX idx_user (user_id)
    -- Note: Foreign key omitted to avoid constraint issues on remote DB
);