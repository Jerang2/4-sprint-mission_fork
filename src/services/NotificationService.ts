import NotificationRepository from '../repositories/NotificationRepository';
import { Notification, NotificationType } from '@prisma/client';
import socketService from '../socket';

class NotificationService {
  async create(
    userId: number,
    type: NotificationType,
    message: string,
    relatedId: number
  ): Promise<Notification> {
    const notification = await NotificationRepository.create(
      userId,
      type,
      message,
      relatedId
    );

    // Emit a socket event to the user
    const io = socketService.getIO();
    io.to(`user-${userId}`).emit('new_notification', notification);

    return notification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return NotificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return NotificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await NotificationRepository.findByIdAndUserId(notificationId, userId);

    if (!notification) {
      throw new Error('Notification not found or you do not have permission to access it.');
    }

    if (notification.isRead) {
      return notification;
    }

    return NotificationRepository.update(notificationId, { isRead: true });
  }
}

export default new NotificationService();
