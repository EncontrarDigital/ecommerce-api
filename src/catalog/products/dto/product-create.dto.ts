import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProductCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  service_fee: number;

  @IsBoolean()
  @IsOptional()
  visible?: boolean;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  stock: number;
}
