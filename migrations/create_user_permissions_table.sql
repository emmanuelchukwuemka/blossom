-- Create user_permissions table for account permissions management
CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_account_permission (account_id, permission_name),
    INDEX idx_account_enabled (account_id, enabled)
    -- Note: Foreign key omitted to avoid constraint issues on remote DB
);