import { Entity, ManyToOne } from 'typeorm';
import { Category } from '../../models/category.entity';
import { Photo } from '../../../../local-files/models/photo.entity';

@Entity('category_photos')
export class CategoryPhoto extends Photo {
  @ManyToOne(() => Category, (category) => category.photos, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  category: Category;
}
