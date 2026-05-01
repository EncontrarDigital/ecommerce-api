import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { SearchTagsService } from './search-tags.service';
import { CreateSearchTagDto } from './dto/create-search-tag.dto';
import { UpdateSearchTagDto } from './dto/update-search-tag.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchTag } from './models/search-tag.entity';

@ApiTags('search-tags')
@Controller('search-tags')
export class SearchTagsController {
  constructor(private searchTagsService: SearchTagsService) {}

  @Get()
  @ApiOkResponse({ type: [SearchTag], description: 'List of all search tags' })
  async findAll() {
    const tags = await this.searchTagsService.findAll();
    return {
      success: true,
      data: tags,
    };
  }

  @Get('/:id')
  @ApiNotFoundResponse({ description: 'Search tag not found' })
  @ApiOkResponse({ type: SearchTag, description: 'Search tag with given id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tag = await this.searchTagsService.findOne(id);
    return {
      success: true,
      data: tag,
    };
  }

  @Post()
  @ApiCreatedResponse({ type: SearchTag, description: 'Search tag created' })
  @ApiBadRequestResponse({ description: 'Invalid search tag data' })
  async create(@Body() createDto: CreateSearchTagDto) {
    const tag = await this.searchTagsService.create(createDto);
    return {
      success: true,
      data: tag,
      message: 'Search tag created successfully',
    };
  }

  @Patch('/:id')
  @ApiBadRequestResponse({ description: 'Invalid search tag data' })
  @ApiOkResponse({ type: SearchTag, description: 'Search tag updated' })
  @ApiNotFoundResponse({ description: 'Search tag not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSearchTagDto,
  ) {
    const tag = await this.searchTagsService.update(id, updateDto);
    return {
      success: true,
      data: tag,
      message: 'Search tag updated successfully',
    };
  }

  @Delete('/:id')
  @ApiOkResponse({ description: 'Search tag deleted' })
  @ApiNotFoundResponse({ description: 'Search tag not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.searchTagsService.delete(id);
    return {
      success: true,
      message: 'Search tag deleted successfully',
    };
  }

  @Put('/reorder')
  @ApiOkResponse({ description: 'Search tags reordered' })
  async reorder(@Body() body: { ids: number[] }) {
    await this.searchTagsService.reorder(body.ids);
    return {
      success: true,
      message: 'Search tags reordered successfully',
    };
  }
}
