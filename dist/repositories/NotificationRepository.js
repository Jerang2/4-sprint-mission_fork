"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
class NotificationRepository {
    async create(userId, type, message, relatedId) {
        return index_1.default.notification.create({
            data: {
                userId,
                type,
                message,
                relatedId,
            },
        });
    }
    async findByUserId(userId) {
        return index_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getUnreadCount(userId) {
        return index_1.default.notification.count({
            where: { userId, isRead: false },
        });
    }
    async findByIdAndUserId(id, userId) {
        return index_1.default.notification.findFirst({
            where: { id, userId },
        });
    }
    async update(id, data) {
        return index_1.default.notification.update({
            where: { id },
            data,
        });
    }
}
exports.default = NotificationRepository;
