import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDeliverySettingsTable1770900000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table already exists
    const tableExists = await queryRunner.hasTable('delivery_settings');
    
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'delivery_settings',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'key',
              type: 'varchar',
              length: '100',
              isUnique: true,
              isNullable: false,
            },
            {
              name: 'value',
              type: 'text',
              isNullable: false,
            },
            {
              name: 'type',
              type: 'varchar',
              length: '20',
              default: "'string'",
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );

      // Popular com valores padrão
      await queryRunner.query(`
        INSERT INTO delivery_settings (key, value, type, description) VALUES
        ('delivery.default_fee', '1000', 'number', 'Taxa de entrega padrão quando não há zonas configuradas (em Kz)'),
        ('delivery.extra_km_fee', '100', 'number', 'Taxa adicional por km quando fora da zona de cobertura (em Kz por km)'),
        ('delivery.default_radius_km', '5', 'number', 'Raio padrão de cobertura quando zona não tem raio definido (em km)'),
        ('delivery.base_location_lat', '-8.9167', 'number', 'Latitude da localização base (Luanda Sul - Talatona)'),
        ('delivery.base_location_lng', '13.1833', 'number', 'Longitude da localização base (Luanda Sul - Talatona)'),
        ('delivery.min_order_for_free_delivery', '0', 'number', 'Valor mínimo do pedido para entrega grátis (0 = desabilitado, em Kz)')
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_settings');
  }
}
