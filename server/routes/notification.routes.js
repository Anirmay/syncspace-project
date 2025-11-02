import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getNotifications, markAsRead, markAllRead, markDirectFromActor } from '../controllers/notification.controller.js';

const router = express.Router();

// GET /api/notifications/ - fetch notifications for logged-in user
router.get('/', protect, getNotifications);

// PATCH /api/notifications/:id/read - mark single notification as read
router.patch('/:id/read', protect, markAsRead);

// PATCH /api/notifications/markAllRead - mark all as read
router.patch('/markAllRead', protect, markAllRead);

// PATCH /api/notifications/markDirectRead/:actorId - mark direct message notifications from actor as read
router.patch('/markDirectRead/:actorId', protect, markDirectFromActor);

export default router;
