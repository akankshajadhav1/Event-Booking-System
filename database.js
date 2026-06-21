const sqlite3 = require('sqlite3').verbose();

// Use a file-based database so data persists across restarts (easier for demo)
const db = new sqlite3.Database('./event_booking.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize Tables
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password_hash TEXT,
                    role TEXT -- 'ORGANIZER' or 'CUSTOMER'
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    description TEXT,
                    date TEXT,
                    total_tickets INTEGER,
                    available_tickets INTEGER,
                    organizer_id INTEGER,
                    FOREIGN KEY(organizer_id) REFERENCES users(id)
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    event_id INTEGER,
                    tickets_booked INTEGER,
                    status TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(event_id) REFERENCES events(id)
                )
            `);
        });
    }
});

// Helper for making db.run promise-based
const run = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this); // this.lastID, this.changes
        });
    });
};

// Helper for making db.get promise-based
const get = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Helper for making db.all promise-based
const all = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = { db, run, get, all };
