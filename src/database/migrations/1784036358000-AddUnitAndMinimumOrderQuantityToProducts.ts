import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUnitAndMinimumOrderQuantityToProducts1784036358000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona coluna 'unit' (unidade de medida)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'unit',
        type: 'varchar',
        length: '20',
        default: "'unidade'",
        comment: 'Unidade de medida: kg, g, litro, ml, unidade, pacote, caixa',
        isNullable: false,
      }),
    );

    // Adiciona coluna 'minimumOrderQuantity' (quantidade mínima de pedido)
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'minimumOrderQuantity',
        type: 'int',
        default: 1,
        comment: 'Quantidade mínima que pode ser encomendada',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove as colunas se necessário reverter
    await queryRunner.dropColumn('products', 'minimumOrderQuantity');
    await queryRunner.dropColumn('products', 'unit');
  }
}
