-- Create user_profile_customizations table for profile customization options
CREATE TABLE IF NOT EXISTS user_profile_customizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    theme VARCHAR(50) DEFAULT 'default',
    layout VARCHAR(50) DEFAULT 'standard',
    color_scheme VARCHAR(50) DEFAULT 'light',
    profile_visibility ENUM('public', 'friends', 'private') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_profile (user_id),
    INDEX idx_user (user_id)
    -- Note: Foreign key omitted to avoid constraint issues on remote DB
);