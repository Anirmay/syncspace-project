const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    about: {
      type: String,
      trim: true,
      default: ''
    },
    // Notification preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    webNotifications: {
      type: Boolean,
      default: true,
    },
    // --- NEW FIELDS ---
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
    // Email change confirmation
    pendingEmail: {
      type: String,
    },
    emailChangeToken: {
      type: String,
    },
    emailChangeExpires: {
      type: Date,
    },
    // --- END NEW FIELDS ---
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
