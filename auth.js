const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hsekhfkjhsdflksdbfkjdshkjfdk';

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const isOrganizer = (req, res, next) => {
    if (req.userRole !== 'ORGANIZER') {
        return res.status(403).json({ message: 'Require Organizer Role!' });
    }
    next();
};

const isCustomer = (req, res, next) => {
    if (req.userRole !== 'CUSTOMER') {
        return res.status(403).json({ message: 'Require Customer Role!' });
    }
    next();
};

module.exports = {
    verifyToken,
    isOrganizer,
    isCustomer,
    JWT_SECRET
};
