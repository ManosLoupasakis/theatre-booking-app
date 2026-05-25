const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Generates 80 seats: 10 VIP (row A), 60 Standard (rows B-G), 10 Balcony (row H)
async function generateSeats(conn, showtimeId) {
  const layout = [
    { label: 'A', count: 10, category: 'vip' },
    { label: 'B', count: 10, category: 'standard' },
    { label: 'C', count: 10, category: 'standard' },
    { label: 'D', count: 10, category: 'standard' },
    { label: 'E', count: 10, category: 'standard' },
    { label: 'F', count: 10, category: 'standard' },
    { label: 'G', count: 10, category: 'standard' },
    { label: 'H', count: 10, category: 'balcony' },
  ];
  const values = [];
  for (const row of layout) {
    for (let n = 1; n <= row.count; n++) {
      values.push([showtimeId, row.label, n, row.category]);
    }
  }
  await conn.query(
    'INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES ?',
    [values]
  );
}

async function initDatabase() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset:  'utf8mb4',
  });

  const db = process.env.DB_NAME;

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${db}\``);

  // ── Tables ─────────────────────────────────────────────────────
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
      FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE,
      FOREIGN KEY (showtime_id) REFERENCES showtimes(showtime_id) ON DELETE CASCADE
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

  // ── Seed data (only if theatres table is empty) ────────────────
  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM theatres');

  if (count === 0) {

    // ── Theatres ──────────────────────────────────────────────────
    const theatres = [
      {
        name: 'Θέατρο Ηρακλείου', location: 'Ηράκλειο, Κρήτη',
        description: 'Το κεντρικό θέατρο του Ηρακλείου με πλούσιο ρεπερτόριο κλασικών και σύγχρονων παραστάσεων.',
      },
      {
        name: 'Δημοτικό Θέατρο Χανίων', location: 'Χανιά, Κρήτη',
        description: 'Ιστορικό θέατρο στην παλιά πόλη των Χανίων, γνωστό για τις υψηλής ποιότητας παραστάσεις του.',
      },
      {
        name: 'Δημοτικό Θέατρο Ρεθύμνου', location: 'Ρέθυμνο, Κρήτη',
        description: 'Θέατρο στο κέντρο του Ρεθύμνου με έντονη πολιτιστική δραστηριότητα όλο το χρόνο.',
      },
      {
        name: 'Δημοτικό Θέατρο Πάτρας', location: 'Πάτρα, Αχαΐα',
        description: 'Το ιστορικότερο θέατρο της Πάτρας, με πλούσιο ρεπερτόριο από κλασικές τραγωδίες έως σύγχρονα έργα.',
      },
      {
        name: 'Κρατικό Θέατρο Βορείου Ελλάδος', location: 'Θεσσαλονίκη',
        description: 'Το μεγαλύτερο δημόσιο θέατρο της Βόρειας Ελλάδας, γνωστό για τις υψηλής ποιότητας παραγωγές του.',
      },
      {
        name: 'Δημοτικό Θέατρο Λάρισας', location: 'Λάρισα, Θεσσαλία',
        description: 'Ένα από τα πιο δραστήρια θέατρα της κεντρικής Ελλάδας με ποικίλες παραστάσεις όλο τον χρόνο.',
      },
      {
        name: 'Δημοτικό Θέατρο Βόλου', location: 'Βόλος, Μαγνησία',
        description: 'Σύγχρονο θέατρο με έντονη πολιτιστική δραστηριότητα και συνεργασίες με θιάσους από όλη την Ελλάδα.',
      },
      {
        name: 'Θέατρο Παλλάς', location: 'Αθήνα',
        description: 'Ένα από τα πιο γνωστά σύγχρονα θέατρα της Αθήνας. Φιλοξενεί μεγάλες παραγωγές, μουσικές παραστάσεις και πολιτιστικά events.',
      },
    ];

    const tId = {};
    for (const t of theatres) {
      const [r] = await conn.query(
        'INSERT INTO theatres (name, location, description) VALUES (?, ?, ?)',
        [t.name, t.location, t.description]
      );
      tId[t.name] = r.insertId;
    }

    // ── Shows ─────────────────────────────────────────────────────
    const shows = [
      // Ηράκλειο
      { theatre: 'Θέατρο Ηρακλείου',               title: 'Αντιγόνη',                   description: 'Η κλασική τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.',                              duration: 100, age: 'All' },
      { theatre: 'Θέατρο Ηρακλείου',               title: 'Οιδίπους Τύραννος',           description: 'Η διαχρονική ιστορία του Οιδίποδα.',                                                  duration: 120, age: '14+' },
      // Χανιά
      { theatre: 'Δημοτικό Θέατρο Χανίων',         title: 'Ρομαίος & Ιουλιέτα',         description: 'Η αθάνατη ιστορία αγάπης του Shakespeare.',                                            duration: 130, age: 'All' },
      // Ρέθυμνο
      { theatre: 'Δημοτικό Θέατρο Ρεθύμνου',       title: 'Βυσσινόκηπος',               description: 'Το αριστούργημα του Τσέχοφ.',                                                          duration: 110, age: 'All' },
      // Πάτρα
      { theatre: 'Δημοτικό Θέατρο Πάτρας',         title: 'Ηλέκτρα',                    description: 'Η συγκλονιστική τραγωδία του Σοφοκλή για την εκδίκηση και τη δικαιοσύνη.',             duration:  95, age: 'All' },
      { theatre: 'Δημοτικό Θέατρο Πάτρας',         title: 'Το Τέλος του Παιχνιδιού',    description: 'Το αριστούργημα του Σάμουελ Μπέκετ σε σκηνοθεσία νέας γενιάς.',                       duration: 100, age: '16+' },
      { theatre: 'Δημοτικό Θέατρο Πάτρας',         title: 'Λυσιστράτη',                 description: 'Η διαχρονική κωμωδία του Αριστοφάνη για ειρήνη και χιούμορ.',                          duration:  90, age: 'All' },
      // ΚΘΒΕ
      { theatre: 'Κρατικό Θέατρο Βορείου Ελλάδος', title: 'Άμλετ',                      description: 'Η μεγάλη τραγωδία του Shakespeare σε εντυπωσιακή σκηνοθεσία.',                        duration: 130, age: '14+' },
      { theatre: 'Κρατικό Θέατρο Βορείου Ελλάδος', title: 'Θείο Φως',                   description: 'Σύγχρονο ελληνικό έργο για την οικογένεια και τις επιλογές ζωής.',                    duration: 110, age: 'All' },
      { theatre: 'Κρατικό Θέατρο Βορείου Ελλάδος', title: 'Μήδεια',                     description: 'Η δυνατή τραγωδία του Ευριπίδη για πάθος και εκδίκηση.',                              duration: 105, age: '14+' },
      // Λάρισα
      { theatre: 'Δημοτικό Θέατρο Λάρισας',        title: 'Ο Θείος Βάνιας',             description: 'Το αριστούργημα του Τσέχοφ για αυταπάτες και χαμένες ευκαιρίες.',                    duration: 115, age: 'All' },
      { theatre: 'Δημοτικό Θέατρο Λάρισας',        title: 'Ορέστης',                    description: 'Η ιστορία του Ορέστη σε σύγχρονη οπτική.',                                            duration: 100, age: '14+' },
      // Βόλος
      { theatre: 'Δημοτικό Θέατρο Βόλου',          title: 'Δον Ζουάν',                  description: 'Το κλασικό έργο του Μολιέρου για έρωτα, εξουσία και τιμωρία.',                        duration: 110, age: 'All' },
      { theatre: 'Δημοτικό Θέατρο Βόλου',          title: 'Η Τρικυμία',                 description: 'Η μαγική τελευταία τραγικωμωδία του Shakespeare.',                                    duration: 120, age: 'All' },
      // Αθήνα
      { theatre: 'Θέατρο Παλλάς',                  title: 'Σφήκες',                     description: 'Σατιρικό έργο που σχολιάζει τη δικαιοσύνη και την πολιτική ζωή της Αθήνας.',           duration: 110, age: '14+' },
      { theatre: 'Θέατρο Παλλάς',                  title: 'Όλα Στάχτη',                 description: 'Σύγχρονη παραγωγή εμπνευσμένη από τις Τρωάδες του Ευριπίδη.',                        duration:  90, age: 'All' },
    ];

    const sId = {};
    for (const s of shows) {
      const [r] = await conn.query(
        'INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES (?, ?, ?, ?, ?)',
        [tId[s.theatre], s.title, s.description, s.duration, s.age]
      );
      sId[s.title] = r.insertId;
    }

    // ── Showtimes ─────────────────────────────────────────────────
    const showtimes = [
      { show: 'Αντιγόνη',                datetime: '2026-06-01 20:00:00', hall: 'Κεντρική Αίθουσα',  price: 25.00 },
      { show: 'Αντιγόνη',                datetime: '2026-06-02 20:00:00', hall: 'Κεντρική Αίθουσα',  price: 25.00 },
      { show: 'Οιδίπους Τύραννος',       datetime: '2026-06-05 21:00:00', hall: 'Αίθουσα Β',          price: 20.00 },
      { show: 'Ρομαίος & Ιουλιέτα',     datetime: '2026-06-10 21:30:00', hall: 'Υπαίθρια Σκηνή',     price: 30.00 },
      { show: 'Βυσσινόκηπος',           datetime: '2026-06-15 19:30:00', hall: 'Μεγάλη Αίθουσα',     price: 22.00 },
      { show: 'Ηλέκτρα',                datetime: '2026-06-03 20:30:00', hall: 'Κεντρική Αίθουσα',  price: 22.00 },
      { show: 'Ηλέκτρα',                datetime: '2026-06-04 20:30:00', hall: 'Κεντρική Αίθουσα',  price: 22.00 },
      { show: 'Το Τέλος του Παιχνιδιού',datetime: '2026-06-07 21:00:00', hall: 'Αίθουσα Β',          price: 18.00 },
      { show: 'Λυσιστράτη',             datetime: '2026-06-12 20:00:00', hall: 'Κεντρική Αίθουσα',  price: 20.00 },
      { show: 'Άμλετ',                  datetime: '2026-06-05 21:00:00', hall: 'Κεντρική Σκηνή',    price: 28.00 },
      { show: 'Άμλετ',                  datetime: '2026-06-06 21:00:00', hall: 'Κεντρική Σκηνή',    price: 28.00 },
      { show: 'Θείο Φως',               datetime: '2026-06-08 20:30:00', hall: 'Μικρή Σκηνή',       price: 20.00 },
      { show: 'Μήδεια',                 datetime: '2026-06-14 21:00:00', hall: 'Κεντρική Σκηνή',    price: 25.00 },
      { show: 'Ο Θείος Βάνιας',         datetime: '2026-06-09 20:00:00', hall: 'Κεντρική Αίθουσα',  price: 18.00 },
      { show: 'Ορέστης',                datetime: '2026-06-11 20:30:00', hall: 'Αίθουσα Α',          price: 20.00 },
      { show: 'Δον Ζουάν',              datetime: '2026-06-13 21:00:00', hall: 'Κεντρική Αίθουσα',  price: 20.00 },
      { show: 'Η Τρικυμία',             datetime: '2026-06-16 20:30:00', hall: 'Κεντρική Αίθουσα',  price: 22.00 },
      { show: 'Σφήκες',                 datetime: '2026-06-20 21:00:00', hall: 'Κεντρική Σκηνή',    price: 15.00 },
      { show: 'Όλα Στάχτη',             datetime: '2026-06-25 20:00:00', hall: 'Κεντρική Σκηνή',    price: 20.00 },
    ];

    for (const st of showtimes) {
      const [r] = await conn.query(
        'INSERT INTO showtimes (show_id, datetime, hall, price) VALUES (?, ?, ?, ?)',
        [sId[st.show], st.datetime, st.hall, st.price]
      );
      await generateSeats(conn, r.insertId);
    }

    console.log(`✓ Sample data inserted: ${theatres.length} θέατρα, ${shows.length} παραστάσεις, ${showtimes.length} ωράρια, ${showtimes.length * 80} θέσεις`);
  }

  // ── Admin user ─────────────────────────────────────────────────
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
