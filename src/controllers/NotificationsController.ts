import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/NotificationService';

class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).id;
      const notifications = await NotificationService.getNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).id;
      const count = await NotificationService.getUnreadCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user as any).id;
      const notificationId = parseInt(req.params.id, 10);
      const notification = await NotificationService.markAsRead(notificationId, userId);
      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationsController();
