import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // recipient when registered
  inviteeEmail: { type: String, lowercase: true, trim: true }, // optional: target email for unregistered users
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who triggered the notification
  type: { type: String, required: true }, // e.g. 'invitation_response', 'invite_sent'
  message: { type: String, required: true },
  link: { type: String },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
