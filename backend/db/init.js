const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  // Connect without specifying a database first, so we can create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: 'utf8mb4',
  });

  const db = process.env.DB_NAME;

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${db}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id    INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      role       ENUM('user','admin') NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS theatres (
      theatre_id  INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(150) NOT NULL,
      location    VARCHAR(200) NOT NULL,
      description TEXT
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS shows (
      show_id     INT AUTO_INCREMENT PRIMARY KEY,
      theatre_id  INT NOT NULL,
      title       VARCHAR(200) NOT NULL,
      description TEXT,
      duration    INT NOT NULL,
      age_rating  VARCHAR(10) DEFAULT 'All',
      FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS showtimes (
      showtime_id INT AUTO_INCREMENT PRIMARY KEY,
      show_id     INT NOT NULL,
      datetime    DATETIME NOT NULL,
      hall        VARCHAR(50) NOT NULL,
      price       DECIMAL(8,2) NOT NULL,
      FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS seats (
      seat_id      INT AUTO_INCREMENT PRIMARY KEY,
      showtime_id  INT NOT NULL,
      row_label    CHAR(1) NOT NULL,
      seat_number  INT NOT NULL,
      category     ENUM('standard','vip','balcony') DEFAULT 'standard',
      UNIQUE KEY uq_seat (showtime_id, row_label, seat_number),
      FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      reservation_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id        INT NOT NULL,
      showtime_id    INT NOT NULL,
      status         ENUM('confirmed','cancelled') DEFAULT 'confirmed',
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)       REFERENCES users(user_id)         ON DELETE CASCADE,
      FOREIGN KEY (showtime_id)   REFERENCES showtimes(showtime_id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reservation_seats (
      reservation_id INT NOT NULL,
      seat_id        INT NOT NULL,
      PRIMARY KEY (reservation_id, seat_id),
      FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
      FOREIGN KEY (seat_id)        REFERENCES seats(seat_id)               ON DELETE CASCADE
    )
  `);

  // Seed sample theatres/shows/showtimes/seats only if empty
  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM theatres');
  if (count === 0) {
    await conn.query(`
      INSERT INTO theatres (name, location, description) VALUES
        ('Θέατρο Ηρακλείου', 'Ηράκλειο, Κρήτη', 'Το κεντρικό θέατρο του Ηρακλείου με πλούσιο ρεπερτόριο κλασικών και σύγχρονων παραστάσεων.'),
        ('Δημοτικό Θέατρο Χανίων', 'Χανιά, Κρήτη', 'Ιστορικό θέατρο στην παλιά πόλη των Χανίων, γνωστό για τις υψηλής ποιότητας παραστάσεις του.'),
        ('Δημοτικό Θέατρο Ρεθύμνου', 'Ρέθυμνο, Κρήτη', 'Θέατρο στο κέντρο του Ρεθύμνου με έντονη πολιτιστική δραστηριότητα όλο το χρόνο.')
    `);

    await conn.query(`
      INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES
        (1, 'Αντιγόνη',          'Η κλασική τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.', 100, 'All'),
        (1, 'Οιδίπους Τύραννος', 'Η διαχρονική ιστορία του Οιδίποδα.',                      120, '14+'),
        (2, 'Ρομαίος & Ιουλιέτα','Η αθάνατη ιστορία αγάπης του Shakespeare.',               130, 'All'),
        (3, 'Βυσσινόκηπος',      'Το αριστούργημα του Τσέχοφ.',                             110, 'All')
    `);

    await conn.query(`
      INSERT INTO showtimes (show_id, datetime, hall, price) VALUES
        (1, '2026-06-01 20:00:00', 'Κεντρική Αίθουσα',  25.00),
        (1, '2026-06-02 20:00:00', 'Κεντρική Αίθουσα',  25.00),
        (2, '2026-06-05 21:00:00', 'Αίθουσα Β',          20.00),
        (3, '2026-06-10 21:30:00', 'Υπαίθρια Σκηνή',     30.00),
        (4, '2026-06-15 19:30:00', 'Μεγάλη Αίθουσα',     22.00)
    `);

    await conn.query(`
      INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES
        (1,'A',1,'vip'),(1,'A',2,'vip'),(1,'A',3,'vip'),(1,'A',4,'vip'),(1,'A',5,'vip'),
        (1,'B',1,'standard'),(1,'B',2,'standard'),(1,'B',3,'standard'),(1,'B',4,'standard'),(1,'B',5,'standard'),
        (1,'C',1,'standard'),(1,'C',2,'standard'),(1,'C',3,'standard'),(1,'C',4,'standard'),(1,'C',5,'standard'),
        (1,'D',1,'balcony'),(1,'D',2,'balcony'),(1,'D',3,'balcony'),(1,'D',4,'balcony'),(1,'D',5,'balcony'),
        (2,'A',1,'vip'),(2,'A',2,'vip'),(2,'A',3,'vip'),(2,'A',4,'vip'),(2,'A',5,'vip'),
        (2,'B',1,'standard'),(2,'B',2,'standard'),(2,'B',3,'standard'),(2,'B',4,'standard'),(2,'B',5,'standard'),
        (2,'C',1,'standard'),(2,'C',2,'standard'),(2,'C',3,'standard'),(2,'C',4,'standard'),(2,'C',5,'standard'),
        (3,'A',1,'vip'),(3,'A',2,'vip'),(3,'A',3,'vip'),
        (3,'B',1,'standard'),(3,'B',2,'standard'),(3,'B',3,'standard'),(3,'B',4,'standard'),(3,'B',5,'standard'),
        (4,'A',1,'vip'),(4,'A',2,'vip'),(4,'A',3,'vip'),(4,'A',4,'vip'),
        (4,'B',1,'standard'),(4,'B',2,'standard'),(4,'B',3,'standard'),(4,'B',4,'standard'),(4,'B',5,'standard'),(4,'B',6,'standard'),
        (4,'C',1,'balcony'),(4,'C',2,'balcony'),(4,'C',3,'balcony'),(4,'C',4,'balcony'),
        (5,'A',1,'vip'),(5,'A',2,'vip'),(5,'A',3,'vip'),
        (5,'B',1,'standard'),(5,'B',2,'standard'),(5,'B',3,'standard'),(5,'B',4,'standard'),(5,'B',5,'standard')
    `);

    console.log('✓ Sample data inserted');
  }

  // Create admin user if not exists
  const [[{ adminCount }]] = await conn.query(
    "SELECT COUNT(*) AS adminCount FROM users WHERE email = 'admin@theater.gr'"
  );
  if (adminCount === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query(
      "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@theater.gr', ?, 'admin')",
      [hash]
    );
    console.log('✓ Admin user created: admin@theater.gr / admin123');
  }

  await conn.end();
  console.log(`✓ Database "${db}" ready`);
}

module.exports = initDatabase;
