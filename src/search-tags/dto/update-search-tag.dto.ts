import { PartialType } from '@nestjs/swagger';
import { CreateSearchTagDto } from './create-search-tag.dto';

export class UpdateSearchTagDto extends PartialType(CreateSearchTagDto) {}
