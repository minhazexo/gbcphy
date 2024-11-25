const express = require('express');
const { login, register } = require('../controllers/authController'); // Import the controller functions
const { verifyToken } = require('../middleware/authMiddleware'); // Optional: for protected routes
const router = express.Router();

// POST /api/auth/register
router.post('/register', register); // Register new users

// POST /api/auth/login
router.post('/login', login); // Log in users

// Example of a protected route (optional)
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route', userId: req.user.userId });
});

module.exports = router;
