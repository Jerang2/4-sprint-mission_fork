"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
class NotificationsController {
    constructor() {
        this.notificationService = new NotificationService_1.default();
    }
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const notifications = await this.notificationService.getNotifications(userId);
            res.status(200).json(notifications);
        }
        catch (error) {
            next(error);
        }
    }
    async getUnreadCount(req, res, next) {
        try {
            const userId = req.user.id;
            const count = await this.notificationService.getUnreadCount(userId);
            res.status(200).json({ count });
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const notificationId = parseInt(req.params.id, 10);
            const notification = await this.notificationService.markAsRead(notificationId, userId);
            res.status(200).json(notification);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new NotificationsController();
