require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const bookingsRoutes = require('./routes/bookings.routes');

app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/bookings', bookingsRoutes);

// Base route
app.get('/', (req, res) => {
    res.json({ message: "Welcome to Event Booking System API" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
