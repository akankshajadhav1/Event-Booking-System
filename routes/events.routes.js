const express = require('express');
const router = express.Router();
const { run, get, all } = require('../database');
const { verifyToken, isOrganizer, isCustomer } = require('../auth');
const { notifyEventUpdate, sendBookingConfirmation } = require('../tasks');

// Create Event (ORGANIZER ONLY)
router.post('/', [verifyToken, isOrganizer], async (req, res) => {
    try {
        const { title, description, date, total_tickets } = req.body;
        const organizer_id = req.userId;

        if (!title || !date || !total_tickets) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const result = await run(
            `INSERT INTO events (title, description, date, total_tickets, available_tickets, organizer_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [title, description, date, total_tickets, total_tickets, organizer_id]
        );

        res.status(201).json({ message: "Event created successfully", eventId: result.lastID });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Event (ORGANIZER ONLY)
router.put('/:id', [verifyToken, isOrganizer], async (req, res) => {
    try {
        const eventId = req.params.id;
        const { title, description, date } = req.body;
        const organizer_id = req.userId;

        // Check if event belongs to organizer
        const event = await get(`SELECT * FROM events WHERE id = ?`, [eventId]);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (event.organizer_id !== organizer_id) {
            return res.status(403).json({ message: "You don't own this event" });
        }

        // Update fields
        await run(
            `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description), date = COALESCE(?, date) WHERE id = ?`,
            [title, description, date, eventId]
        );

        // BACKGROUND TASK 2 TRIGGER
        notifyEventUpdate(eventId);

        res.status(200).json({ message: "Event updated successfully and background notification triggered." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List Events (PUBLIC/CUSTOMER)
router.get('/', async (req, res) => {
    try {
        const events = await all(`SELECT * FROM events`);
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Book Event (CUSTOMER ONLY)
router.post('/:id/book', [verifyToken, isCustomer], async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.userId;
        const { tickets_booked } = req.body;

        if (!tickets_booked || tickets_booked <= 0) {
            return res.status(400).json({ message: "Invalid number of tickets." });
        }

        // Check availability
        const event = await get(`SELECT * FROM events WHERE id = ?`, [eventId]);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.available_tickets < tickets_booked) {
            return res.status(400).json({ message: "Not enough tickets available." });
        }

        // Create booking and update available tickets
        const result = await run(
            `INSERT INTO bookings (user_id, event_id, tickets_booked, status) VALUES (?, ?, ?, 'CONFIRMED')`,
            [userId, eventId, tickets_booked]
        );

        await run(
            `UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?`,
            [tickets_booked, eventId]
        );

        // BACKGROUND TASK 1 TRIGGER
        sendBookingConfirmation(result.lastID, userId, eventId, tickets_booked);

        res.status(201).json({ message: "Booking successful, confirmation email background task triggered.", bookingId: result.lastID });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
