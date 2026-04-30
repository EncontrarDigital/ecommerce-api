import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliverySetting } from './models/delivery-setting.entity';
import { UpdateDeliverySettingDto } from './dto/update-delivery-setting.dto';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class DeliverySettingsService {
  constructor(
    @InjectRepository(DeliverySetting)
    private deliverySettingRepository: Repository<DeliverySetting>,
  ) {}

  async getAllSettings(): Promise<DeliverySetting[]> {
    return this.deliverySettingRepository.find({
      order: { key: 'ASC' },
    });
  }

  async getSettingByKey(key: string): Promise<DeliverySetting> {
    const setting = await this.deliverySettingRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundError('delivery_setting', 'key', key);
    }

    return setting;
  }

  async updateSetting(
    key: string,
    updateDto: UpdateDeliverySettingDto,
  ): Promise<DeliverySetting> {
    const setting = await this.getSettingByKey(key);

    // Converter valor para string baseado no tipo
    let stringValue: string;

    if (setting.type === 'number') {
      const numValue = parseFloat(String(updateDto.value));
      if (isNaN(numValue)) {
        throw new Error('Value must be a valid number');
      }
      stringValue = String(numValue);
    } else if (setting.type === 'boolean') {
      const boolValue =
        updateDto.value === true ||
        updateDto.value === 'true' ||
        updateDto.value === '1' ||
        updateDto.value === 1;
      stringValue = boolValue ? 'true' : 'false';
    } else if (setting.type === 'json') {
      try {
        stringValue = JSON.stringify(updateDto.value);
      } catch (e) {
        throw new Error('Value must be valid JSON');
      }
    } else {
      stringValue = String(updateDto.value);
    }

    setting.value = stringValue;
    return this.deliverySettingRepository.save(setting);
  }

  // Método helper para obter valor tipado
  async getTypedValue(key: string): Promise<string | number | boolean | any> {
    const setting = await this.getSettingByKey(key);

    if (setting.type === 'number') {
      return parseFloat(setting.value);
    } else if (setting.type === 'boolean') {
      return setting.value === 'true';
    } else if (setting.type === 'json') {
      return JSON.parse(setting.value);
    }

    return setting.value;
  }
}
