import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { NotificationsModule } from 'src/notifications/notification.module';
import { OrdersModule } from 'src/sales/orders/orders.module';

@Module({
  imports: [
    NotificationsModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
