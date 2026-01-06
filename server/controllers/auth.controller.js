import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // Import nodemailer

// --- REGISTER ---
export const register = async (req, res) => {
  try {
    // check for username OR email
    const userExists = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists.' });
    }

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
export const login = async (req, res) => {
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
      expiresIn: '1d',
    });

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      })
      .status(200)
      .json({
        message: 'Logged in successfully',
        token: token, // Include token in response so frontend can store it
        user: { id: user._id, username: user.username, email: user.email },
      });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// --- FORGOT PASSWORD (UPDATED with email sending) ---
export const forgotPassword = async (req, res) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587', 10),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetURL = `https://syncspace-project.netlify.app/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"SyncSpace Support" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request for SyncSpace',
            text: `You requested a password reset. Please click this link to reset your password: ${resetURL}\n\nIf you did not request this, please ignore this email. This link will expire in 10 minutes.`,
            html: `<p>You requested a password reset. Please click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a><p>If you did not request this, please ignore this email. This link will expire in 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (emailError) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.error("Email Sending Error:", emailError);
        return res.status(500).json({ message: 'There was an error sending the password reset email. Please try again later.' });
    }

  } catch (error) {
    if (user) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        try { await user.save({ validateBeforeSave: false }); } catch (saveError) { console.error("Error saving user after failed forgot password:", saveError); }
    }
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Error processing forgot password request.', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const loginToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Password has been reset successfully.',
      token: loginToken,
      user: { id: user._id, username: user.username, email: user.email },
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: 'Error resetting password.', error: error.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }).status(200).json({ message: 'Logged out successfully' });
};