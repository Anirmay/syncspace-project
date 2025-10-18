// server/routes/auth.routes.js

const express = require('express');
// 👇 Import both register and login
const { register, login } = require('../controllers/auth.controller.js');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login  (👈 New Route)
router.post('/login', login);

module.exports = router;