import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchTag } from './models/search-tag.entity';
import { SearchTagsService } from './search-tags.service';
import { SearchTagsController } from './search-tags.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SearchTag])],
  controllers: [SearchTagsController],
  providers: [SearchTagsService],
  exports: [SearchTagsService],
})
export class SearchTagsModule {}
