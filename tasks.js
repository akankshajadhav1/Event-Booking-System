const { all, get } = require('./database');

/**
 * Background Task 1: Booking Confirmation
 * Triggered when a customer successfully books tickets.
 * Simulates sending a booking confirmation email.
 */
const sendBookingConfirmation = async (bookingId, userId, eventId, ticketsBooked) => {
    // Simulate delay for email sending process (e.g. 2 seconds)
    setTimeout(async () => {
        try {
            // Fetch User Details
            const user = await get(`SELECT username FROM users WHERE id = ?`, [userId]);
            // Fetch Event Details
            const event = await get(`SELECT title, date FROM events WHERE id = ?`, [eventId]);

            console.log(`\n=================================================`);
            console.log(`[BACKGROUND TASK 1: EMAIL CONFIRMATION]`);
            console.log(`Sending Email to: ${user.username}`);
            console.log(`Subject: Booking Confirmation - ${event.title}`);
            console.log(`Body: You have successfully booked ${ticketsBooked} tickets for ${event.title} on ${event.date}.`);
            console.log(`=================================================\n`);
        } catch (error) {
            console.error('[BACKGROUND TASK 1 ERROR] Failed to simulate email:', error);
        }
    }, 2000);
};

/**
 * Background Task 2: Event Update Notification
 * Triggered when an event is updated.
 * Notifies all customers who have booked tickets for that event.
 */
const notifyEventUpdate = async (eventId) => {
    // Simulate delay for notification process (e.g. 2 seconds)
    setTimeout(async () => {
        try {
            // Fetch Event Details
            const event = await get(`SELECT title FROM events WHERE id = ?`, [eventId]);
            
            // Fetch all users who booked this event
            const bookings = await all(`
                SELECT DISTINCT u.username 
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                WHERE b.event_id = ?
            `, [eventId]);

            if (bookings.length > 0) {
                console.log(`\n=================================================`);
                console.log(`[BACKGROUND TASK 2: EVENT UPDATE NOTIFICATION]`);
                console.log(`Event "${event.title}" has been updated.`);
                console.log(`Notifying the following customers:`);
                bookings.forEach(b => {
                    console.log(`  - Sending push notification to ${b.username}`);
                });
                console.log(`=================================================\n`);
            }
        } catch (error) {
            console.error('[BACKGROUND TASK 2 ERROR] Failed to simulate notifications:', error);
        }
    }, 2000);
};

module.exports = {
    sendBookingConfirmation,
    notifyEventUpdate
};
