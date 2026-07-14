import { Module } from '@nestjs/common';
import { CategoryPhotosService } from './category-photos.service';
import { CategoryPhotosController } from './category-photos.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalFilesModule } from '../../../local-files/local-files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../models/category.entity';
import { CategoryPhoto } from './models/category-photo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, CategoryPhoto]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get<string>('uploadPath'),
      }),
      inject: [ConfigService],
    }),
    LocalFilesModule,
  ],
  providers: [CategoryPhotosService],
  controllers: [CategoryPhotosController],
  exports: [CategoryPhotosService],
})
export class CategoryPhotosModule {}
