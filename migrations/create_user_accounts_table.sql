-- Create user_accounts table for multi-account management
CREATE TABLE IF NOT EXISTS user_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    account_type ENUM('personal', 'business', 'affiliate', 'vendor') DEFAULT 'personal',
    display_name VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_main_email (main_user_id, email),
    INDEX idx_main_user (main_user_id)
    -- Note: Foreign key omitted to avoid constraint issues on remote DB
);