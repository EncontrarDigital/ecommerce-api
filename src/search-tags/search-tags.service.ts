import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchTag } from './models/search-tag.entity';
import { CreateSearchTagDto } from './dto/create-search-tag.dto';
import { UpdateSearchTagDto } from './dto/update-search-tag.dto';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class SearchTagsService {
  constructor(
    @InjectRepository(SearchTag)
    private searchTagRepository: Repository<SearchTag>,
  ) {}

  async findAll(): Promise<SearchTag[]> {
    return this.searchTagRepository.find({
      order: {
        order: 'ASC',
        click_count: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<SearchTag> {
    const tag = await this.searchTagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundError('search_tag', 'id', id.toString());
    }
    return tag;
  }

  async create(createDto: CreateSearchTagDto): Promise<SearchTag> {
    const tag = this.searchTagRepository.create(createDto);
    return this.searchTagRepository.save(tag);
  }

  async update(id: number, updateDto: UpdateSearchTagDto): Promise<SearchTag> {
    const tag = await this.findOne(id);
    Object.assign(tag, updateDto);
    return this.searchTagRepository.save(tag);
  }

  async delete(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.searchTagRepository.remove(tag);
  }

  async reorder(ids: number[]): Promise<void> {
    // Atualizar ordem baseado na posição no array
    for (let i = 0; i < ids.length; i++) {
      await this.searchTagRepository.update(ids[i], { order: i + 1 });
    }
  }
}
