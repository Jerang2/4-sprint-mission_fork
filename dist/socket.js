"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("./index"));
class SocketService {
    constructor() {
        this.io = new socket_io_1.Server({
            cors: {
                origin: '*', // Be more specific in production
                methods: ['GET', 'POST'],
            },
        });
        this.io.use(this.authenticate.bind(this));
    }
    async authenticate(socket, next) {
        try {
            const token = socket.handshake.auth.accessToken;
            if (!token) {
                return next(new Error('Authentication error: Token not provided.'));
            }
            const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
            const userId = decodedToken.userId;
            const user = await index_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return next(new Error('Authentication error: User not found.'));
            }
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication error: Invalid token.'));
        }
    }
    initialize(httpServer) {
        this.io.attach(httpServer);
        this.io.on('connection', (socket) => {
            const user = socket.user;
            console.log(`Socket connected: ${user.nickname} (ID: ${user.id})`);
            socket.join(`user-${user.id}`);
            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${user.nickname} (ID: ${user.id})`);
            });
        });
    }
    getIO() {
        return this.io;
    }
}
const socketService = new SocketService();
exports.default = socketService;
