-- Theater Booking App - Database Schema
-- Run this file in MariaDB to create and populate the database

CREATE DATABASE IF NOT EXISTS theater_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE theater_booking;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  user_id   INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS theatres (
  theatre_id  INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  location    VARCHAR(200) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS shows (
  show_id     INT AUTO_INCREMENT PRIMARY KEY,
  theatre_id  INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  duration    INT NOT NULL COMMENT 'minutes',
  age_rating  VARCHAR(10) DEFAULT 'All',
  FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS showtimes (
  showtime_id INT AUTO_INCREMENT PRIMARY KEY,
  show_id     INT NOT NULL,
  datetime    DATETIME NOT NULL,
  hall        VARCHAR(50) NOT NULL,
  price       DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seats (
  seat_id      INT AUTO_INCREMENT PRIMARY KEY,
  showtime_id  INT NOT NULL,
  row_label    CHAR(1) NOT NULL,
  seat_number  INT NOT NULL,
  category     ENUM('standard', 'vip', 'balcony') DEFAULT 'standard',
  UNIQUE KEY uq_seat (showtime_id, row_label, seat_number),
  FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  showtime_id    INT NOT NULL,
  status         ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservation_seats (
  reservation_id INT NOT NULL,
  seat_id        INT NOT NULL,
  PRIMARY KEY (reservation_id, seat_id),
  FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  FOREIGN KEY (seat_id) REFERENCES seats(seat_id) ON DELETE CASCADE
);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

INSERT IGNORE INTO theatres (name, location, description) VALUES
  ('Θέατρο Ηρακλείου', 'Ηράκλειο, Κρήτη', 'Το κεντρικό θέατρο του Ηρακλείου με πλούσιο ρεπερτόριο κλασικών και σύγχρονων παραστάσεων.'),
  ('Δημοτικό Θέατρο Χανίων', 'Χανιά, Κρήτη', 'Ιστορικό θέατρο στην παλιά πόλη των Χανίων, γνωστό για τις υψηλής ποιότητας παραστάσεις του.'),
  ('Δημοτικό Θέατρο Ρεθύμνου', 'Ρέθυμνο, Κρήτη', 'Θέατρο στο κέντρο του Ρεθύμνου με έντονη πολιτιστική δραστηριότητα όλο το χρόνο.');

INSERT IGNORE INTO shows (theatre_id, title, description, duration, age_rating) VALUES
  (1, 'Αντιγόνη', 'Η κλασική τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.', 100, 'All'),
  (1, 'Οιδίπους Τύραννος', 'Η διαχρονική ιστορία του Οιδίποδα.', 120, '14+'),
  (2, 'Ρομαίος & Ιουλιέτα', 'Η αθάνατη ιστορία αγάπης του Shakespeare.', 130, 'All'),
  (3, 'Βυσσινόκηπος', 'Το αριστούργημα του Τσέχοφ.', 110, 'All');

INSERT IGNORE INTO showtimes (show_id, datetime, hall, price) VALUES
  (1, '2026-06-01 20:00:00', 'Κεντρική Αίθουσα', 25.00),
  (1, '2026-06-02 20:00:00', 'Κεντρική Αίθουσα', 25.00),
  (2, '2026-06-05 21:00:00', 'Αίθουσα Β', 20.00),
  (3, '2026-06-10 21:30:00', 'Υπαίθρια Σκηνή', 30.00),
  (4, '2026-06-15 19:30:00', 'Μεγάλη Αίθουσα', 22.00);

-- Seats for showtime 1 (4 rows x 5 seats)
INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
  (1,'A',1,'vip'),(1,'A',2,'vip'),(1,'A',3,'vip'),(1,'A',4,'vip'),(1,'A',5,'vip'),
  (1,'B',1,'standard'),(1,'B',2,'standard'),(1,'B',3,'standard'),(1,'B',4,'standard'),(1,'B',5,'standard'),
  (1,'C',1,'standard'),(1,'C',2,'standard'),(1,'C',3,'standard'),(1,'C',4,'standard'),(1,'C',5,'standard'),
  (1,'D',1,'balcony'),(1,'D',2,'balcony'),(1,'D',3,'balcony'),(1,'D',4,'balcony'),(1,'D',5,'balcony');

-- Seats for showtime 2
INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
  (2,'A',1,'vip'),(2,'A',2,'vip'),(2,'A',3,'vip'),(2,'A',4,'vip'),(2,'A',5,'vip'),
  (2,'B',1,'standard'),(2,'B',2,'standard'),(2,'B',3,'standard'),(2,'B',4,'standard'),(2,'B',5,'standard'),
  (2,'C',1,'standard'),(2,'C',2,'standard'),(2,'C',3,'standard'),(2,'C',4,'standard'),(2,'C',5,'standard');

-- Seats for showtime 3
INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
  (3,'A',1,'vip'),(3,'A',2,'vip'),(3,'A',3,'vip'),
  (3,'B',1,'standard'),(3,'B',2,'standard'),(3,'B',3,'standard'),(3,'B',4,'standard'),(3,'B',5,'standard');

-- Seats for showtime 4
INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
  (4,'A',1,'vip'),(4,'A',2,'vip'),(4,'A',3,'vip'),(4,'A',4,'vip'),
  (4,'B',1,'standard'),(4,'B',2,'standard'),(4,'B',3,'standard'),(4,'B',4,'standard'),(4,'B',5,'standard'),(4,'B',6,'standard'),
  (4,'C',1,'balcony'),(4,'C',2,'balcony'),(4,'C',3,'balcony'),(4,'C',4,'balcony');

-- Seats for showtime 5
INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
  (5,'A',1,'vip'),(5,'A',2,'vip'),(5,'A',3,'vip'),
  (5,'B',1,'standard'),(5,'B',2,'standard'),(5,'B',3,'standard'),(5,'B',4,'standard'),(5,'B',5,'standard');
