import NotificationRepository from '../repositories/NotificationRepository';
import { Notification, NotificationType } from '@prisma/client';
import socketService from '../socket';

export default class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async create(
    userId: number,
    type: NotificationType,
    message: string,
    relatedId: number
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create(
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
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findByIdAndUserId(notificationId, userId);

    if (!notification) {
      throw new Error('Notification not found or you do not have permission to access it.');
    }

    if (notification.isRead) {
      return notification;
    }

    return this.notificationRepository.update(notificationId, { isRead: true });
  }
}
