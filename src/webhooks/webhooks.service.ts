import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from 'src/notifications.gateway';
import { NotificationsService } from 'src/notifications/notification.service';
import { OrderNotificationDto } from './dto/order-notification.dto';
import { Role } from 'src/users/models/role.enum';
import { NotificationType } from 'src/notifications/models/notification.entity';
import { OrdersService } from 'src/sales/orders/orders.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly notificationsService: NotificationsService,
    private readonly ordersService: OrdersService,
  ) {}

  /**
   * Processa notificação de pedido recebida via webhook
   * Envia notificação em tempo real para admins/managers via Socket.io
   */
  async processOrderNotification(data: OrderNotificationDto): Promise<void> {
    try {
      // Preparar mensagem de notificação
      const notificationMessage = this.buildNotificationMessage(data);

      // 1. Enviar notificação em tempo real via Socket.io para admins/managers
      this.notificationsGateway.sendNotificationToRole('admin', {
        type: data.type,
        title: data.title,
        message: notificationMessage,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        orderStatus: data.orderStatus,
        totalAmount: data.totalAmount,
        source: data.source || 'external',
        createdAt: data.createdAt || new Date().toISOString(),
        metadata: data.metadata,
      });

      this.notificationsGateway.sendNotificationToRole('manager', {
        type: data.type,
        title: data.title,
        message: notificationMessage,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        orderStatus: data.orderStatus,
        totalAmount: data.totalAmount,
        source: data.source || 'external',
        createdAt: data.createdAt || new Date().toISOString(),
        metadata: data.metadata,
      });

      console.log(`✅ Notification broadcasted to admins/managers for order #${data.orderNumber}`);

      // 2. Emitir eventos específicos de pedidos para atualização da lista em tempo real
      if (data.type === 'new_order') {
        // Buscar pedido completo do banco de dados
        try {
          const fullOrder = await this.ordersService.getOrder(data.orderId);
          if (fullOrder) {
            // Broadcast order:created event com dados completos
            this.notificationsGateway.broadcastOrderCreated(fullOrder);
            console.log(`📦 Order created event broadcasted with full data for order #${data.orderNumber}`);
          } else {
            console.warn(`⚠️ Could not find order ${data.orderId} to broadcast`);
          }
        } catch (error) {
          console.error(`❌ Error fetching order ${data.orderId}:`, error.message);
        }
      } else if (data.type === 'order_status_update') {
        // Buscar pedido completo do banco de dados
        try {
          const fullOrder = await this.ordersService.getOrder(data.orderId);
          if (fullOrder) {
            // Broadcast order:updated event com dados completos
            this.notificationsGateway.broadcastOrderUpdated(fullOrder);
            console.log(`📝 Order updated event broadcasted with full data for order #${data.orderNumber}`);
          } else {
            console.warn(`⚠️ Could not find order ${data.orderId} to broadcast`);
          }
        } catch (error) {
          console.error(`❌ Error fetching order ${data.orderId}:`, error.message);
        }
      }

      // 3. Salvar notificação no banco de dados para todos os admins/managers
      await this.notificationsService.notifyUsersByRole({
        role: Role.Admin,
        title: data.title,
        message: notificationMessage,
        type: this.mapNotificationType(data.type),
        relatedEntityId: data.orderId, // Número, não string
        actionUrl: `/orders/${data.orderId}`,
      });

      await this.notificationsService.notifyUsersByRole({
        role: Role.Manager,
        title: data.title,
        message: notificationMessage,
        type: this.mapNotificationType(data.type),
        relatedEntityId: data.orderId, // Número, não string
        actionUrl: `/orders/${data.orderId}`,
      });

      console.log(`✅ Notifications saved to database for admins/managers`);

    } catch (error) {
      console.error('❌ Error processing order notification:', error.message);
      // Não lançar erro para não quebrar o webhook
    }
  }

  /**
   * Constrói mensagem de notificação baseada no tipo
   */
  private buildNotificationMessage(data: OrderNotificationDto): string {
    const orderNumber = data.orderNumber || data.orderId;
    const amount = data.totalAmount ? ` no valor de ${data.totalAmount} MZN` : '';
    
    switch (data.type) {
      case 'new_order':
        return data.message || `Novo pedido #${orderNumber} recebido${amount}`;
      case 'order_status_update':
        return data.message || `Pedido #${orderNumber} atualizado para ${data.orderStatus}`;
      default:
        return data.message || `Notificação sobre pedido #${orderNumber}`;
    }
  }

  /**
   * Mapeia tipo de notificação do webhook para o tipo do sistema
   */
  private mapNotificationType(type: string): NotificationType {
    switch (type) {
      case 'new_order':
        return NotificationType.ORDER;
      case 'order_status_update':
        return NotificationType.ORDER;
      default:
        return NotificationType.GENERAL;
    }
  }
}
