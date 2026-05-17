-- Migration: Add role to users table
USE theater_booking;

ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Create a default admin account (password: admin123)
-- bcrypt hash of 'admin123' with 10 salt rounds
INSERT INTO users (name, email, password, role) VALUES (
  'Admin',
  'admin@theater.gr',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin'
) ON DUPLICATE KEY UPDATE role = 'admin';
