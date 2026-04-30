import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeliverySettingDto {
  @ApiProperty({
    description: 'New value for the setting',
    example: 1500,
  })
  @IsNotEmpty()
  value: string | number | boolean;
}
