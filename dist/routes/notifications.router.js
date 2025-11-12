"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationsController_1 = __importDefault(require("../controllers/NotificationsController"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = (0, express_1.Router)();
router.get('/notifications', auth_middleware_1.default, NotificationsController_1.default.getNotifications);
router.get('/notifications/unread-count', auth_middleware_1.default, NotificationsController_1.default.getUnreadCount);
router.patch('/notifications/:id/read', auth_middleware_1.default, NotificationsController_1.default.markAsRead);
exports.default = router;
