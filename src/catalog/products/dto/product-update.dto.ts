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

export class ProductUpdateDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  description_en?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  comission?: number;

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

  @IsString()
  @IsOptional()
  photosOrder?: string;

  @IsNumber()
  @IsOptional()
  shopId?: number;
}
