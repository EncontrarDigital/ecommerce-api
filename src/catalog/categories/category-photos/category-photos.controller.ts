import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../../users/models/role.enum';
import { Category } from '../models/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryPhotosService } from './category-photos.service';
import { fileBodySchema } from '../../../local-files/models/file-body.schema';
import { fileResponseSchema } from '../../../local-files/models/file-response.schema';
import { Response } from 'express';
import { FileDTO } from 'src/local-files/upload.dto';
import { memoryStorage } from 'multer';

@ApiTags('categories')
@Controller('categories/:id')
export class CategoryPhotosController {
  constructor(private categoryPhotosService: CategoryPhotosService) {}

  @Get('photos/:photoId')
  @ApiOkResponse({
    schema: fileResponseSchema,
    description: 'Category photo with given id',
  })
  @ApiProduces('image/*')
  @ApiNotFoundResponse({ description: 'Category photo not found' })
  async getCategoryPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
    @Res() res: Response,
    @Query('thumbnail') thumbnail?: string,
  ) {
    // Converter string para boolean, default false
    const useThumbnail = thumbnail === 'true';

    const result = await this.categoryPhotosService.getCategoryPhoto(
      id,
      photoId,
      useThumbnail,
    );

    const fileBuffer = await result.arrayBuffer();
    const byteArray = new Uint8Array(fileBuffer);

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=86400',
    });

    res.send(Buffer.from(byteArray));
  }

  @Post('photos')
  // @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiCreatedResponse({ type: Category, description: 'Category photo added' })
  @ApiBody({ schema: fileBodySchema })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // <- GARANTE o buffer disponível
    }),
  )
  async addCategoryPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Category> {
    const fileDTO: FileDTO = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };
    return await this.categoryPhotosService.addCategoryPhoto(id, fileDTO);
  }

  @Delete('photos/:photoId')
  // @Roles(Role.Admin, Role.Manager, Role.Sales)
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  @ApiForbiddenResponse({ description: 'User not authorized' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  @ApiOkResponse({ type: Category, description: 'Category photo deleted' })
  async deleteCategoryPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoId', ParseIntPipe) photoId: number,
  ): Promise<Category> {
    return await this.categoryPhotosService.deleteCategoryPhoto(id, photoId);
  }
}
