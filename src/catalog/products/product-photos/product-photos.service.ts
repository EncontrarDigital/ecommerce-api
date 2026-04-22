import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductPhoto } from './models/product-photo.entity';
import { Repository } from 'typeorm';
import { LocalFilesService } from '../../../local-files/local-files.service';
import { NotFoundError } from '../../../errors/not-found.error';
import { Product } from '../models/product.entity';
import { FileDTO } from 'src/local-files/upload.dto';

@Injectable()
export class ProductPhotosService {
  constructor(
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(ProductPhoto)
    private productPhotosRepository: Repository<ProductPhoto>,
    private localFilesService: LocalFilesService,
  ) {}

  async getProductPhotos(): Promise<ProductPhoto[]> {
    return this.productPhotosRepository.find({
      relations: ['product'],
    });
  }

 async getProductPhoto(
    productId: number,
    photoId: number,
    thumbnail: boolean,
  ) {
    const productPhoto = await this.productPhotosRepository.findOne({
      where: { id: photoId, product: { id: productId } },
    });

    if (!productPhoto) {
      throw new NotFoundError('product photo', 'id', photoId.toString());
    }

    const path = thumbnail ? productPhoto.thumbnailPath : productPhoto.path;
    const mimeType = productPhoto.mimeType;

    const file = await this.localFilesService.getPhoto(path);
    if (!file) {
      throw new NotFoundError('product photo', 'file', path);
    }

    return await file;
  }

  async createProductPhoto(
    id: number,
    file: FileDTO,
    mimeType: string,
  ): Promise<ProductPhoto> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundError('product', 'id', id.toString());
    }
    const photo = new ProductPhoto();
    
    let extension = file.originalname.split('.').pop();
    const filePath = `originals/${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}.${extension}`;
    photo.path = filePath;
    photo.mimeType = mimeType;
    photo.thumbnailPath = await this.localFilesService.createPhotoThumbnail(
      file,
    );
    photo.placeholderBase64 =
      await this.localFilesService.createPhotoPlaceholder(file);
    product.photos.push(photo);
    await this.productsRepository.save(product);
    // Nova foto no início da lista
    if (product.photosOrder) {
      product.photosOrder = [photo.id, ...product.photosOrder.split(',')].join(
        ',',
      );
    } else {
      product.photosOrder = photo.id?.toString();
    }
    await this.productsRepository.save(product);
    return photo;
  }

  async addProductPhoto(id: number, file: FileDTO): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id }, relations: ['photos'] });
    if (!product) {
      throw new NotFoundError('product', 'id', id.toString());
    }

    const photo = new ProductPhoto();
    const { path, mimeType } = await this.localFilesService.savePhoto(file);
    photo.path = path;
    photo.mimeType = mimeType;
    photo.thumbnailPath = await this.localFilesService.createPhotoThumbnail(file);

    product.photos.push(photo);

    await this.productsRepository.save(product);

    // Nova foto no início da lista
    product.photosOrder = product.photosOrder
      ? [photo.id, ...product.photosOrder.split(',')].join(',')
      : photo.id.toString();

    return this.productsRepository.save(product);
  }

  async deleteProductPhoto(id: number, photoId: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['photos']
    });
    
    if (!product) {
      throw new NotFoundError('product', 'id', id.toString());
    }

    // Encontrar a foto antes de deletar para obter os caminhos dos arquivos
    const photoToDelete = product.photos.find((p) => p.id === photoId);
    
    if (photoToDelete) {
      // Deletar arquivos físicos do Supabase em background (não bloqueia a resposta)
      this.deletePhotoFiles(photoToDelete).catch((error) => {
        console.error(`❌ Erro ao deletar arquivos da foto ${photoId}:`, error.message);
      });
    }

    // Remover foto da lista
    product.photos = product.photos.filter((p) => p.id !== photoId);
    await this.productsRepository.save(product);
    
    // Atualizar ordem das fotos
    if (product.photosOrder) {
      product.photosOrder = product.photosOrder
        .split(',')
        .filter((p) => p !== photoId.toString())
        .join(',');
    }
    
    return this.productsRepository.save(product);
  }

  /**
   * Deletar arquivos físicos da foto (original e thumbnail)
   * @private
   */
  private async deletePhotoFiles(photo: ProductPhoto): Promise<void> {
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
