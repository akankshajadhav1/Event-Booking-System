const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../database');
const { JWT_SECRET } = require('../auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: "Please provide username, password, and role (ORGANIZER or CUSTOMER)." });
        }

        if (role !== 'ORGANIZER' && role !== 'CUSTOMER') {
            return res.status(400).json({ message: "Role must be ORGANIZER or CUSTOMER." });
        }

        const password_hash = bcrypt.hashSync(password, 8);

        await run(`INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)`, [username, password_hash, role]);
        
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: "Username already exists." });
        }
        res.status(500).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await get(`SELECT * FROM users WHERE username = ?`, [username]);

        if (!user) {
            return res.status(404).json({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password_hash);

        if (!passwordIsValid) {
            return res.status(401).json({ accessToken: null, message: "Invalid Password!" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
