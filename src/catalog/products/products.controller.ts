import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './models/product.entity';
import { Role } from '../../users/models/role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { AttributeDto } from './dto/attribute.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  // ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  // ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReqUser } from '../../auth/decorators/user.decorator';
import { User } from '../../users/models/user.entity';
import { ProductFilterDto } from './dto/product-filter.dto';
import { Request } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: [Product], description: 'List of all products' })
  @ApiQuery({ name: 'context', required: false, type: String })
  getProducts(
    @Query() filters: ProductFilterDto,
    @ReqUser() user: User,
    @Req() req: Request,
  ): Promise<Product[]> {
    // Only show hidden products if isAdmin is true (dashboard/store)
    const onlyVisible = !req['isAdmin'];
    return this.productsService.getProducts(filters, user, onlyVisible);
  }

  @Get('/paginated')
  @ApiOkResponse({ type: [Product], description: 'Paginated list of products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'context', required: false, type: String })
  async getProductsPaginated(
    @Query() filters: ProductFilterDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @ReqUser() user: User,
    @Req() req: Request,
  ) {
    const onlyVisible = !req['isAdmin'];
    return this.productsService.getProductsPaginated(filters, user, onlyVisible, page, limit);
  }

  @Get('/:id')
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiOkResponse({ type: Product, description: 'Product with given id' })
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
    @ReqUser() user?: User,
  ): Promise<Product> {
    // Verifica o papel do usuário e decide a visibilidade do produto
    const withHidden = user && [Role.Admin, Role.Manager, Role.Sales].includes(user.role);
  
    // Chama o serviço com o valor apropriado de `withHidden` e `user`
    return this.productsService.getProduct(id, withHidden, user);
  }

  @Post()
  @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiCreatedResponse({ type: Product, description: 'Product created' })
  @ApiBadRequestResponse({ description: 'Invalid product data' })
  createProduct(@Body() product: ProductCreateDto, @ReqUser() user?: User): Promise<Product> {
    return this.productsService.createProduct(product, user);
  }

  @Patch('/:id')
  @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiOkResponse({ type: Product, description: 'Product updated' })
  @ApiBadRequestResponse({ description: 'Invalid product data' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() product: ProductUpdateDto,
  ): Promise<Product> {
    return await this.productsService.updateProduct(id, product);
  }

  @Delete('/:id')
  @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiOkResponse({ description: 'Product deleted' })
  async deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productsService.deleteProduct(id);
  }

  @Patch('/:id/attributes')
  @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiOkResponse({ type: Product, description: 'Product attributes updated' })
  @ApiBody({ type: [AttributeDto] })
  async updateProductAttributes(
    @Param('id', ParseIntPipe) id: number,
    @Body() attributes: AttributeDto[],
  ): Promise<Product> {
    return await this.productsService.updateProductAttributes(id, attributes);
  }

  @Get('/by-shop/:shopId')
  @ApiOkResponse({ type: [Product], description: 'List of products by shop id' })
  @ApiNotFoundResponse({ description: 'No products found for this shop' })
  async getProductsByShopId(@Param('shopId', ParseIntPipe) shopId: number): Promise<Product[]> {
    return this.productsService.getProductsByShopId(shopId);
  }

  
  @Get('/dashboard/low-stock')
  async getLowStockProductsCount(
    @Query('quantity', new DefaultValuePipe(5), ParseIntPipe) quantity: number,
    @ReqUser() user: User,
  ) {
    const count = await this.productsService.getLowStockProductsCount(quantity, user);
    return { totalLowStockProducts: count };
  }
}
