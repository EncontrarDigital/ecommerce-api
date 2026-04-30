import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGpsFieldsToAddresses1770900000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns already exist before adding
    const table = await queryRunner.getTable('addresses');
    
    if (!table?.findColumnByName('latitude')) {
      await queryRunner.addColumn(
        'addresses',
        new TableColumn({
          name: 'latitude',
          type: 'decimal',
          precision: 10,
          scale: 8,
          isNullable: true,
          comment: 'Latitude da zona de entrega',
        }),
      );
    }

    if (!table?.findColumnByName('longitude')) {
      await queryRunner.addColumn(
        'addresses',
        new TableColumn({
          name: 'longitude',
          type: 'decimal',
          precision: 11,
          scale: 8,
          isNullable: true,
          comment: 'Longitude da zona de entrega',
        }),
      );
    }

    if (!table?.findColumnByName('radius_km')) {
      await queryRunner.addColumn(
        'addresses',
        new TableColumn({
          name: 'radius_km',
          type: 'int',
          isNullable: true,
          default: 5,
          comment: 'Raio de cobertura em km',
        }),
      );
    }

    if (!table?.findColumnByName('is_zone')) {
      await queryRunner.addColumn(
        'addresses',
        new TableColumn({
          name: 'is_zone',
          type: 'boolean',
          default: false,
          comment: 'Se é uma zona de entrega com coordenadas',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('addresses', 'is_zone');
    await queryRunner.dropColumn('addresses', 'radius_km');
    await queryRunner.dropColumn('addresses', 'longitude');
    await queryRunner.dropColumn('addresses', 'latitude');
  }
}
