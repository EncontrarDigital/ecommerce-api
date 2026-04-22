import {
  IsInt,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsPostalCode,
  IsString,
  IsIn,
  IsDateString,
  Matches,
} from 'class-validator';

export class OrderDeliveryDto {
  @IsInt()
  @IsNotEmpty()
  methodId: number;

  @IsOptional()
  deliveryStatus?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  @IsPostalCode('any')
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  @IsISO31661Alpha2()
  country: string;

  @IsOptional()
  @IsInt()
  addressId?: number;

  @IsOptional()
  @IsIn(['standard', 'scheduled'])
  delivery_option?: 'standard' | 'scheduled';

  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2} - \d{2}:\d{2}$/, {
    message: 'Formato de horário inválido. Use: HH:MM - HH:MM',
  })
  scheduled_time?: string;
}
