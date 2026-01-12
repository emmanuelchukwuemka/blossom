-- Create user_badges table for profile badges and achievements
CREATE TABLE IF NOT EXISTS user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_badge (user_id, badge_name),
    INDEX idx_user (user_id)
    -- Note: Foreign key omitted to avoid constraint issues on remote DB
);