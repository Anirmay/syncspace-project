const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // <-- NEW: Import nodemailer

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

// --- FORGOT PASSWORD (UPDATED with email sending) ---
exports.forgotPassword = async (req, res) => {
  let user; // Define user outside the try block to access in catch
  try {
    // 1. Find user by email
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Send success response even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // 2. Generate a random reset token (UNHASHED version)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 3. Hash the token and set expiry for DATABASE storage
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken) // Hash the unhashed token
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    await user.save();

    // --- NEW EMAIL SENDING LOGIC ---
    try {
        // 4. Create Nodemailer Transporter (using .env variables)
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587', 10), // Default to 587 if not set
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 5. Construct Reset URL (Use your frontend URL and the UNHASHED token)
        // IMPORTANT: Use your actual deployed frontend URL in production
        const resetURL = `http://localhost:5173/reset-password/${resetToken}`; 

        // 6. Define Mail Options
        const mailOptions = {
            from: `"SyncSpace Support" <${process.env.EMAIL_USER}>`, // Sender address
            to: user.email, // Recipient
            subject: 'Password Reset Request for SyncSpace', // Subject line
            text: `You requested a password reset. Please click this link to reset your password: ${resetURL}\n\nIf you did not request this, please ignore this email. This link will expire in 10 minutes.`, // Plain text body
            html: `<p>You requested a password reset. Please click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a><p>If you did not request this, please ignore this email. This link will expire in 10 minutes.</p>`, // HTML body
        };

        // 7. Send Mail
        await transporter.sendMail(mailOptions);

        // 8. Send generic success response to the frontend user
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (emailError) {
        // If email sending fails, clear the reset token fields from the user in DB
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error("Email Sending Error:", emailError);
        // Send a generic error to the user, don't expose email details
        return res.status(500).json({ message: 'There was an error sending the password reset email. Please try again later.' });
    }
    // --- END NEW EMAIL SENDING LOGIC ---

    // REMOVED the old testing response that sent the token back

  } catch (error) {
    // General error handling (e.g., database error before email attempt)
    // Invalidate token fields on error if user was found
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        // Use try-catch here in case save fails, prevent unhandled rejection
        try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Error saving user after failed forgot password:", saveError); }
    }
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Error processing forgot password request.', error: error.message });
  }
};


// --- RESET PASSWORD (no changes needed here) ---
exports.resetPassword = async (req, res) => {
  try {
    // 1. Get user based on the token (hashed token)
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token) // Get token from URL parameter
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token is still valid (not expired)
    });

    // 2. If token not found or expired
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // 3. Set the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt); // Get new password from request body
    user.passwordResetToken = undefined; // Clear the token fields
    user.passwordResetExpires = undefined;
    await user.save();

    // 4. Log the user in (optional, but good UX) - create a new JWT
    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Password has been reset successfully.',
      token: loginToken, // Send back a login token
      user: { id: user._id, username: user.username, email: user.email },
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: 'Error resetting password.', error: error.message });
  }
};

