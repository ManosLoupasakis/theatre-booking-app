# Theatre Booking App

Εφαρμογή κράτησης θέσεων θεάτρου — React Native (Expo) frontend + Node.js/Express backend + MariaDB.

---

## Απαιτήσεις

Πριν ξεκινήσεις, βεβαιώσου ότι έχεις εγκατεστημένα:

- [Node.js](https://nodejs.org/) (v18+)
- [MariaDB](https://mariadb.org/) ή MySQL
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

---

## 1. Κλωνοποίηση

```bash
git clone https://github.com/ManosLoupasakis/theatre-booking-app.git
cd theatre-booking-app
```

---

## 2. Ρύθμιση Backend

### 2α. Εγκατάσταση dependencies

```bash
cd backend
npm install
```

### 2β. Δημιουργία αρχείου `.env`

Μέσα στον φάκελο `backend/` δημιούργησε αρχείο `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ΤΟ_PASSWORD_ΤΗΣ_ΒΑΣΗΣ_ΣΟΥ
DB_NAME=theater_booking
JWT_SECRET=κάποιο_μυστικό_κλειδί
PORT=3000
```

> **Σημείωση:** Άλλαξε το `DB_PASSWORD` με τον κωδικό του MariaDB/MySQL που έχεις.

### 2γ. Εκκίνηση MariaDB

```bash
# macOS (Homebrew)
brew services start mariadb

# Linux
sudo systemctl start mariadb

# Windows
# Εκκίνηση από τις Υπηρεσίες ή μέσω XAMPP/WAMP
```

### 2δ. Εκκίνηση server

```bash
npm start
```

Ο server τρέχει στο `http://localhost:3000`.

Κατά την **πρώτη εκκίνηση**, δημιουργούνται αυτόματα:
- Η βάση δεδομένων `theater_booking`
- Όλοι οι πίνακες
- Δείγματα θεάτρων, παραστάσεων και ωραρίων
- Λογαριασμός **admin** με:
  - Email: `admin@theatre.gr`
  - Password: `admin123`

---

## 3. Ρύθμιση Frontend

Άνοιξε νέο terminal:

```bash
cd frontend
npm install
```

---

## 4. Εκκίνηση Εφαρμογής

```bash
npm start
```

Ανοίγει το Expo DevTools. Στη συνέχεια:

| Πλατφόρμα | Εντολή |
|-----------|--------|
| Web (browser) | Πάτα `w` στο terminal |
| Android emulator | Πάτα `a` (χρειάζεται Android Studio) |
| iOS simulator | Πάτα `i` (μόνο macOS, χρειάζεται Xcode) |
| Φυσική συσκευή | Κατέβασε το **Expo Go** app και σκάναρε το QR code |

> **Android emulator:** Ο backend χρησιμοποιεί αυτόματα `http://10.0.2.2:3000` αντί για `localhost`.  
> **Web/iOS:** Χρησιμοποιεί `http://localhost:3000`.

---

## 5. Δομή Project

```
theatre-booking-app/
├── backend/
│   ├── controllers/     # Λογική HTTP handlers
│   ├── db/
│   │   ├── connection.js  # Σύνδεση με βάση
│   │   └── init.js        # Αυτόματη δημιουργία βάσης & δεδομένων
│   ├── middleware/      # JWT auth, admin check
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── server.js
│   └── .env             # ⚠️ Δεν ανεβαίνει στο git
└── frontend/
    ├── components/      # Κοινά components (Toast, ConfirmModal)
    ├── screens/         # Οθόνες εφαρμογής
    ├── services/
    │   └── api.js       # Κλήσεις στο backend
    └── App.js
```

---

## 6. Λογαριασμοί

| Ρόλος | Email | Password |
|-------|-------|----------|
| Admin | `admin@theatre.gr` | `admin123` |

Νέοι χρήστες μπορούν να εγγραφούν μέσω της εφαρμογής. Ο admin μπορεί να αναβαθμίσει οποιονδήποτε χρήστη σε admin από τον πίνακα ελέγχου.
