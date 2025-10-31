import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getNotifications, markAsRead, markAllRead } from '../controllers/notification.controller.js';

const router = express.Router();

// GET /api/notifications/ - fetch notifications for logged-in user
router.get('/', protect, getNotifications);

// PATCH /api/notifications/:id/read - mark single notification as read
router.patch('/:id/read', protect, markAsRead);

// PATCH /api/notifications/markAllRead - mark all as read
router.patch('/markAllRead', protect, markAllRead);

export default router;
