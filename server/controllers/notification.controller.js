import Notification from '../models/Notification.js';

// Get notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fetch notifications addressed to the user id OR to the user's email (covers invites sent before registration)
    const userEmail = req.user.email && req.user.email.toLowerCase();
    console.log('getNotifications: userId=', userId.toString(), 'userEmail=', userEmail);
    const notifications = await Notification.find({
      $or: [ { user: userId }, { inviteeEmail: userEmail } ]
    }).populate('actor', 'username email').sort({ createdAt: -1 }).limit(50);
    console.log('getNotifications: found', notifications.length, 'notifications for', userEmail || userId.toString());
    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this notification.' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error marking notification.' });
  }
};

// Mark all notifications as read for the logged-in user
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error marking notifications.' });
  }
};

export { getNotifications, markAsRead, markAllRead };
