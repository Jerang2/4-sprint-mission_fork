"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationRepository_1 = __importDefault(require("../repositories/NotificationRepository"));
const socket_1 = __importDefault(require("../socket"));
class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository_1.default();
    }
    async create(userId, type, message, relatedId) {
        const notification = await this.notificationRepository.create(userId, type, message, relatedId);
        // Emit a socket event to the user
        const io = socket_1.default.getIO();
        io.to(`user-${userId}`).emit('new_notification', notification);
        return notification;
    }
    async getNotifications(userId) {
        return this.notificationRepository.findByUserId(userId);
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.getUnreadCount(userId);
    }
    async markAsRead(notificationId, userId) {
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
exports.default = NotificationService;
