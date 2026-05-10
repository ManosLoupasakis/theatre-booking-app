require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes        = require('./routes/auth');
const theatreRoutes     = require('./routes/theatres');
const showRoutes        = require('./routes/shows');
const showtimeRoutes    = require('./routes/showtimes');
const seatRoutes        = require('./routes/seats');
const reservationRoutes = require('./routes/reservations');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/',             authRoutes);
app.use('/theatres',     theatreRoutes);
app.use('/shows',        showRoutes);
app.use('/showtimes',    showtimeRoutes);
app.use('/seats',        seatRoutes);
app.use('/reservations', reservationRoutes);
app.use('/user/reservations', reservationRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
