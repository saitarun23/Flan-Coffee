-- Create database and tables for Flan Coffee admin app
CREATE DATABASE IF NOT EXISTS flancoffee DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE flancoffee;

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  admin_id VARCHAR(100) PRIMARY KEY,
  password VARCHAR(255) NOT NULL
);

-- Products table (simple schema)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  weight VARCHAR(50) DEFAULT NULL,
  quantity INT DEFAULT 0,
  image LONGTEXT DEFAULT NULL
);

-- Seed admin user (plaintext password '12345' will be migrated to bcrypt on first login)
INSERT IGNORE INTO admin (admin_id, password) VALUES ('admin', '12345');
