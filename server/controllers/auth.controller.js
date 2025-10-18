// server/controllers/auth.controller.js

const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER ---
exports.register = async (req, res) => {
  try {
    // 👇 This line is updated to check for username OR email
    const userExists = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (userExists) {
      // 👇 The error message is now more helpful
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

    // The rest of the function remains the same
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User created successfully', userId: savedUser._id });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};


// --- LOGIN ---
// Make sure this part is exactly as written below
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};