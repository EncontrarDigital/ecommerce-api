import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryPhoto } from './models/category-photo.entity';
import { Repository } from 'typeorm';
import { LocalFilesService } from '../../../local-files/local-files.service';
import { NotFoundError } from '../../../errors/not-found.error';
import { Category } from '../models/category.entity';
import { FileDTO } from 'src/local-files/upload.dto';

@Injectable()
export class CategoryPhotosService {
  constructor(
    @InjectRepository(Category) private categoriesRepository: Repository<Category>,
    @InjectRepository(CategoryPhoto)
    private categoryPhotosRepository: Repository<CategoryPhoto>,
    private localFilesService: LocalFilesService,
  ) {}

  async getCategoryPhotos(): Promise<CategoryPhoto[]> {
    return this.categoryPhotosRepository.find({
      relations: ['category'],
    });
  }

  async getCategoryPhoto(
    categoryId: number,
    photoId: number,
    thumbnail: boolean,
  ) {
    const categoryPhoto = await this.categoryPhotosRepository.findOne({
      where: { id: photoId, category: { id: categoryId } },
    });

    if (!categoryPhoto) {
      throw new NotFoundError('category photo', 'id', photoId.toString());
    }

    const path = thumbnail ? categoryPhoto.thumbnailPath : categoryPhoto.path;
    const mimeType = categoryPhoto.mimeType;

    const file = await this.localFilesService.getPhoto(path);
    if (!file) {
      throw new NotFoundError('category photo', 'file', path);
    }

    return await file;
  }

  async addCategoryPhoto(id: number, file: FileDTO): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ 
      where: { id }, 
      relations: ['photos'] 
    });
    
    if (!category) {
      throw new NotFoundError('category', 'id', id.toString());
    }

    const photo = new CategoryPhoto();
    const { path, mimeType } = await this.localFilesService.savePhoto(file);
    photo.path = path;
    photo.mimeType = mimeType;
    photo.thumbnailPath = await this.localFilesService.createPhotoThumbnail(file);
    photo.placeholderBase64 = await this.localFilesService.createPhotoPlaceholder(file);

    if (!category.photos) {
      category.photos = [];
    }
    category.photos.push(photo);

    return this.categoriesRepository.save(category);
  }

  async deleteCategoryPhoto(id: number, photoId: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ 
      where: { id },
      relations: ['photos']
    });
    
    if (!category) {
      throw new NotFoundError('category', 'id', id.toString());
    }

    // Encontrar a foto antes de deletar para obter os caminhos dos arquivos
    const photoToDelete = category.photos?.find((p) => p.id === photoId);
    
    if (photoToDelete) {
      // Deletar arquivos físicos do Supabase em background (não bloqueia a resposta)
      this.deletePhotoFiles(photoToDelete).catch((error) => {
        console.error(`❌ Erro ao deletar arquivos da foto ${photoId}:`, error.message);
      });
    }

    // Remover foto da lista
    category.photos = category.photos?.filter((p) => p.id !== photoId) || [];
    
    return this.categoriesRepository.save(category);
  }

  /**
   * Deletar arquivos físicos da foto (original e thumbnail)
   * @private
   */
  private async deletePhotoFiles(photo: CategoryPhoto): Promise<void> {
    try {
      // Deletar arquivo original
      if (photo.path) {
        await this.localFilesService.deletePhoto(photo.path);
        console.log(`✅ Arquivo original deletado: ${photo.path}`);
      }

      // Deletar thumbnail
      if (photo.thumbnailPath) {
        await this.localFilesService.deletePhoto(photo.thumbnailPath);
        console.log(`✅ Thumbnail deletado: ${photo.thumbnailPath}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar arquivos físicos:', error);
      throw error;
    }
  }
}
