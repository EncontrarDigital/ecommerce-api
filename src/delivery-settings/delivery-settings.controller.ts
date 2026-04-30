import {
  Body,
  Controller,
  Get,
  Param,
  Put,
} from '@nestjs/common';
import { DeliverySettingsService } from './delivery-settings.service';
import { UpdateDeliverySettingDto } from './dto/update-delivery-setting.dto';
import { DeliverySetting } from './models/delivery-setting.entity';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('delivery-settings')
@Controller('delivery-settings')
export class DeliverySettingsController {
  constructor(private deliverySettingsService: DeliverySettingsService) {}

  @Get()
  @ApiOkResponse({
    type: [DeliverySetting],
    description: 'List of all delivery settings',
  })
  async getAllSettings(): Promise<DeliverySetting[]> {
    return this.deliverySettingsService.getAllSettings();
  }

  @Get('/:key')
  @ApiNotFoundResponse({ description: 'Setting not found' })
  @ApiOkResponse({
    type: DeliverySetting,
    description: 'Delivery setting with given key',
  })
  async getSettingByKey(@Param('key') key: string): Promise<DeliverySetting> {
    return this.deliverySettingsService.getSettingByKey(key);
  }

  @Put('/:key')
  @ApiBadRequestResponse({ description: 'Invalid setting value' })
  @ApiOkResponse({
    type: DeliverySetting,
    description: 'Setting updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  async updateSetting(
    @Param('key') key: string,
    @Body() updateDto: UpdateDeliverySettingDto,
  ): Promise<DeliverySetting> {
    return this.deliverySettingsService.updateSetting(key, updateDto);
  }
}
