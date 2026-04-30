import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { AddressService, AddressFilters } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './models/address.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('address')
@Controller('address')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Get()
  @ApiOkResponse({ type: [Address], description: 'List of all addresses' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiQuery({ name: 'hasGps', required: false, description: 'Filter by GPS coordinates' })
  @ApiQuery({ name: 'isZone', required: false, description: 'Filter by zone status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page' })
  async getAddresses(
    @Query('search') search?: string,
    @Query('hasGps') hasGps?: string,
    @Query('isZone') isZone?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const filters: AddressFilters = {
      search,
      hasGps: hasGps === 'true',
      isZone: isZone === 'true',
      page: page ? parseInt(page, 10) : undefined,
      perPage: perPage ? parseInt(perPage, 10) : undefined,
    };

    const result = await this.addressService.getAddresses(filters);
    
    // Retornar no formato esperado pelo frontend Angular
    return {
      success: true,
      data: result,
    };
  }

  @Get('/:id')
  @ApiNotFoundResponse({ description: 'Address not found' })
  @ApiOkResponse({ type: Address, description: 'Address with given id' })
  async getAddress(@Param('id', ParseIntPipe) id: number) {
    const address = await this.addressService.getAddress(id);
    return {
      success: true,
      data: address,
    };
  }

  @Post()
  @ApiCreatedResponse({ type: Address, description: 'Address created' })
  @ApiBadRequestResponse({ description: 'Invalid address data' })
  async createAddress(@Body() address: CreateAddressDto) {
    const created = await this.addressService.createAddress(address);
    return {
      success: true,
      data: created,
      message: 'Address created successfully',
    };
  }

  @Patch('/:id')
  @ApiBadRequestResponse({ description: 'Invalid address data' })
  @ApiOkResponse({ type: Address, description: 'Address updated' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  async updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() address: UpdateAddressDto,
  ) {
    const updated = await this.addressService.updateAddress(id, address);
    return {
      success: true,
      data: updated,
      message: 'Address updated successfully',
    };
  }

  @Delete('/:id')
  @ApiOkResponse({ type: Address, description: 'Address deleted' })
  @ApiNotFoundResponse({ description: 'Address not found' })
  async deleteAddress(@Param('id', ParseIntPipe) id: number) {
    await this.addressService.deleteAddress(id);
    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
} 