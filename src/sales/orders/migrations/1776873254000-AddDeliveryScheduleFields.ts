import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeliveryScheduleFields1776873254000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'order_deliveries',
      new TableColumn({
        name: 'delivery_option',
        type: 'varchar',
        length: '20',
        default: "'standard'",
        comment: 'Tipo de entrega: standard ou scheduled',
      }),
    );

    await queryRunner.addColumn(
      'order_deliveries',
      new TableColumn({
        name: 'scheduled_date',
        type: 'date',
        isNullable: true,
        comment: 'Data agendada para entrega',
      }),
    );

    await queryRunner.addColumn(
      'order_deliveries',
      new TableColumn({
        name: 'scheduled_time',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Horário agendado (ex: 14:00 - 14:30)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('order_deliveries', 'scheduled_time');
    await queryRunner.dropColumn('order_deliveries', 'scheduled_date');
    await queryRunner.dropColumn('order_deliveries', 'delivery_option');
  }
}
