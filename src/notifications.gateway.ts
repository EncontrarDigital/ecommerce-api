// notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: [
            'https://admin.encontrarshopping.com',
            'https://encontrarshopping.com',
            'http://localhost:4200',
            'http://localhost:3000',
            /\.vercel\.app$/, // Permitir todos os domínios Vercel
        ],
        credentials: true,
        methods: ['GET', 'POST'],
    },
    path: '/socket.io/', // Path explícito
    transports: ['polling'], // Apenas polling para Railway (mais confiável)
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    // Configurações importantes para Railway
    serveClient: false,
    cookie: false,
    // Configurações adicionais para ambientes cloud
    allowUpgrades: false, // Não permitir upgrade para WebSocket
    perMessageDeflate: false, // Desabilitar compressão
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private clients: Map<number, string> = new Map(); // userId -> socket.id
    private userEmails: Map<number, string> = new Map(); // userId -> email

    constructor(private usersService: UsersService) {}

    afterInit(server: Server) {
        console.log('🚀 WebSocket server initialized for notifications');
        console.log('📡 Transport: polling only (optimized for Railway)');
    }

    async handleConnection(client: Socket) {
        const userId = Number(client.handshake.query.userId);
        console.log('🔌 Connection attempt from userId:', userId, 'transport:', client.conn.transport.name);
        
        if (userId && !isNaN(userId)) {
            try {
                // Buscar o email do usuário
                const user = await this.usersService.getUser(userId);
                const userEmail = user?.email || `user-${userId}`;
                
                this.clients.set(userId, client.id);
                this.userEmails.set(userId, userEmail);
                
                console.log(`✅ User ${userEmail} (ID: ${userId}) connected with socket ${client.id}`);
                console.log(`📊 Total connected clients: ${this.clients.size}`);
            } catch (error) {
                console.error(`❌ Error fetching user ${userId}:`, error.message);
                this.clients.set(userId, client.id);
                console.log(`✅ User ID ${userId} connected with socket ${client.id}`);
                console.log(`📊 Total connected clients: ${this.clients.size}`);
            }
        } else {
            console.warn('⚠️ Connection attempt without valid userId');
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.clients.entries()].find(([, id]) => id === client.id)?.[0];
        if (userId) {
            const userEmail = this.userEmails.get(userId) || `user-${userId}`;
            this.clients.delete(userId);
            this.userEmails.delete(userId);
            console.log(`❌ User ${userEmail} (ID: ${userId}) disconnected`);
            console.log(`📊 Total connected clients: ${this.clients.size}`);
        }
    }

    sendNotificationToUser(userId: number, notification: any) {
        const socketId = this.clients.get(userId);
        const userEmail = this.userEmails.get(userId) || `user-${userId}`;
        console.log(`📤 Attempting to send notification to ${userEmail} (ID: ${userId}), socket: ${socketId}`);
        
        if (socketId) {
            this.server.to(socketId).emit('notification', notification);
            console.log(`✅ Notification sent to ${userEmail} (ID: ${userId})`);
        } else {
            console.log(`⚠️ User ${userEmail} (ID: ${userId}) not connected, notification not sent in real-time`);
        }
    }

    sendNotificationToRole(role: string, payload: any) {
        this.server.to(`role_${role}`).emit('notification', payload);
    }

    broadcastOrderCreated(order: any) {
        console.log('📦 Broadcasting order created:', order.id);
        this.server.emit('order:created', order);
    }

    broadcastOrderUpdated(order: any) {
        console.log('📝 Broadcasting order updated:', order.id);
        this.server.emit('order:updated', order);
    }

    @SubscribeMessage('joinRole')
    handleJoinRole(client: Socket, role: string) {
        client.join(`role_${role}`);
    }
}
