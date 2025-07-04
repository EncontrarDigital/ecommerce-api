import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ShopkeeperSalesService } from './shopkeepersales.service';
import { ShopkeeperSaleCreateDto } from './dto/shopkeepersale-create.dto';
import { ShopkeeperSaleUpdateDto } from './dto/shopkeepersale-update.dto';
import { ShopkeeperSale } from './shopkeepersale.entity';
import { ReqUser } from '../../auth/decorators/user.decorator';
import { User } from '../../users/models/user.entity';
import { ShopkeeperSaleFilterDto } from './dto/shopkeepersale-filter.dto';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';

@ApiTags('shopkeepersales')
@Controller('shopkeepersales')
export class ShopkeeperSalesController {
  constructor(private readonly shopkeeperSalesService: ShopkeeperSalesService) {}

  @Post()
  @ApiCreatedResponse({ type: ShopkeeperSale, description: 'ShopkeeperSale created' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  create(@Body() createDto: ShopkeeperSaleCreateDto): Promise<ShopkeeperSale> {
    return this.shopkeeperSalesService.create(createDto);
  }

  @Get()
  @ApiOkResponse({ type: [ShopkeeperSale], description: 'List of all ShopkeeperSales' })
  async findAll(@Query() filters: ShopkeeperSaleFilterDto): Promise<ShopkeeperSale[]> {
    return this.shopkeeperSalesService.findAll(filters);
  }

  @Get(':id')
  @ApiOkResponse({ type: ShopkeeperSale, description: 'ShopkeeperSale with given id' })
  @ApiNotFoundResponse({ description: 'ShopkeeperSale not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ShopkeeperSale> {
    return this.shopkeeperSalesService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ShopkeeperSale, description: 'ShopkeeperSale updated' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @ApiNotFoundResponse({ description: 'ShopkeeperSale not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: ShopkeeperSaleUpdateDto,
  ): Promise<ShopkeeperSale> {
    return this.shopkeeperSalesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'ShopkeeperSale deleted' })
  @ApiNotFoundResponse({ description: 'ShopkeeperSale not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.shopkeeperSalesService.remove(id);
  }

  @Post('my/create')
  @UseGuards(SessionAuthGuard)
  @ApiCreatedResponse({ type: ShopkeeperSale, description: 'ShopkeeperSale created for logged user' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  async createForUser(
    @ReqUser() user: User,
    @Body() createDto: ShopkeeperSaleCreateDto,
  ): Promise<ShopkeeperSale> {
    if (!user) throw new UnauthorizedException('User not authenticated');
    return this.shopkeeperSalesService.createForUser(user, createDto);
  }

  @Get('my/findAllForUser')
  @UseGuards(SessionAuthGuard)
  @ApiOkResponse({ type: [ShopkeeperSale], description: 'List of ShopkeeperSales for logged user' })
  async findMySales(@ReqUser() user: User, @Query() filters: ShopkeeperSaleFilterDto): Promise<ShopkeeperSale[]> {
    if (!user) throw new UnauthorizedException('User not authenticated');
    return this.shopkeeperSalesService.findAllForUser(user, filters);
  }
} 