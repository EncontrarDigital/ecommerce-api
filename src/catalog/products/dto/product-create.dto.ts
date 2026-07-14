import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductUnit } from '../enums/product-unit.enum';

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  description_en?: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  comission: number;

  @IsString()
  @IsOptional()
  @IsIn(Object.values(ProductUnit), {
    message: 'Unidade inválida. Use: kg, g, mg, litro, ml, unidade, pacote, caixa, duzia, metro, cm',
  })
  unit?: string;

  @IsNumber()
  @Min(1, { message: 'A quantidade mínima deve ser pelo menos 1' })
  @IsOptional()
  minimumOrderQuantity?: number;

  @IsNumber()
  @IsOptional()
  shopId?: number;
}
