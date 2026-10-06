-- ============================================================================
-- RentCar — Full-Stack Car Rental Management System
-- Database: rentcar_db (MySQL 8.0+)
-- Note: Spring Boot JPA (ddl-auto=update) and DataSeeder automatically create
--       and populate all tables on startup. This SQL script is provided as a
--       reference schema and manual setup option.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS rentcar_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rentcar_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255),
    driving_license_number VARCHAR(50),
    profile_image VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- 2. CARS TABLE
CREATE TABLE IF NOT EXISTS cars (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(80) NOT NULL,
    model VARCHAR(80) NOT NULL,
    year INT NOT NULL,
    category VARCHAR(30) NOT NULL,
    fuel_type VARCHAR(30) NOT NULL,
    transmission VARCHAR(30) NOT NULL,
    seats INT NOT NULL,
    doors INT NOT NULL,
    luggage_capacity INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cars_category (category),
    INDEX idx_cars_location (location),
    INDEX idx_cars_status (status),
    INDEX idx_cars_price (price_per_day)
) ENGINE=InnoDB;

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(40) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    pickup_location VARCHAR(120) NOT NULL,
    drop_location VARCHAR(120) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_date DATE NOT NULL,
    return_time TIME NOT NULL,
    number_of_days INT NOT NULL,
    selected_extras VARCHAR(255),
    coupon_code VARCHAR(50),
    base_amount DECIMAL(10, 2) NOT NULL,
    extra_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id),
    INDEX idx_bookings_user (user_id),
    INDEX idx_bookings_car_dates (car_id, status, pickup_date, return_date),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB;

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    transaction_id VARCHAR(60) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB;

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL UNIQUE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reviews_car FOREIGN KEY (car_id) REFERENCES cars(id),
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_reviews_car (car_id)
) ENGINE=InnoDB;

-- 6. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    car_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_favorites_user_car UNIQUE (user_id, car_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_booking_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    usage_limit INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(40) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- 9. MAINTENANCE TABLE
CREATE TABLE IF NOT EXISTS maintenance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    car_id BIGINT NOT NULL,
    description VARCHAR(500) NOT NULL,
    maintenance_date DATE NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_maintenance_car FOREIGN KEY (car_id) REFERENCES cars(id),
    INDEX idx_maintenance_car (car_id),
    INDEX idx_maintenance_status (status)
) ENGINE=InnoDB;
