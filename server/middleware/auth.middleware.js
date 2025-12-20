const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  // ✅ 1. Check if token exists in Cookies (This is what makes it work!)
  if (req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: Check if token is in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // ✅ Verify whatever token we found
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Success! Move to the route
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token found in Cookie OR Header
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };