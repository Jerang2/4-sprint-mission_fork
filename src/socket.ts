import { Server, Socket } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import prisma from './index';
import { User } from '@prisma/client';

interface DecodedToken {
  userId: number;
}

class SocketService {
  private io: Server;

  constructor() {
    this.io = new Server({
      cors: {
        origin: '*', // Be more specific in production
        methods: ['GET', 'POST'],
      },
    });

    this.io.use(this.authenticate.bind(this));
  }

  private async authenticate(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.accessToken;
      if (!token) {
        return next(new Error('Authentication error: Token not provided.'));
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as DecodedToken;
      const userId = decodedToken.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token.'));
    }
  }

  public initialize(httpServer: http.Server): void {
    this.io.attach(httpServer);

    this.io.on('connection', (socket: Socket) => {
      const user: User = (socket as any).user;
      console.log(`Socket connected: ${user.nickname} (ID: ${user.id})`);
      socket.join(`user-${user.id}`);

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${user.nickname} (ID: ${user.id})`);
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }
}

const socketService = new SocketService();

export default socketService;
