import prisma from '../index';
import { Notification, NotificationType } from '@prisma/client';

export default class NotificationRepository {
  async create(
    userId: number,
    type: NotificationType,
    message: string,
    relatedId: number
  ): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId,
        type,
        message,
        relatedId,
      },
    });
  }

  async findByUserId(userId: number): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Notification | null> {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  }

  async update(id: number, data: Partial<Notification>): Promise<Notification> {
    return prisma.notification.update({
      where: { id },
      data,
    });
  }
}
