const express = require('express');
const router = express.Router();
const { all } = require('../database');
const { verifyToken, isCustomer } = require('../auth');

// List my bookings (CUSTOMER ONLY)
router.get('/', [verifyToken, isCustomer], async (req, res) => {
    try {
        const userId = req.userId;
        const bookings = await all(`
            SELECT b.id, b.tickets_booked, b.status, e.title as event_title, e.date as event_date
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            WHERE b.user_id = ?
        `, [userId]);
        
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
