import { Router } from 'express';
import NotificationsController from '../controllers/NotificationsController';
import authMiddleware from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/notifications',
  authMiddleware,
  NotificationsController.getNotifications
);

router.get(
  '/notifications/unread-count',
  authMiddleware,
  NotificationsController.getUnreadCount
);

router.patch(
  '/notifications/:id/read',
  authMiddleware,
  NotificationsController.markAsRead
);

export default router;
