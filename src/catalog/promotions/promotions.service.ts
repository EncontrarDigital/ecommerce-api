import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Promotion } from './models/promotion.entity';
import { NotFoundError } from '../../errors/not-found.error';
import { NotRelatedError } from '../../errors/not-related.error';
import { ConflictError } from '../../errors/conflict.error';
import { PromotionCreateDto } from './dto/promotion-create.dto';
import { PromotionUpdateDto } from './dto/promotion-update.dto';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/models/product.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
    private productsService: ProductsService,
  ) {}

  async getPromotions(withProducts = false): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      relations: [...(withProducts ? ['products'] : [])],
      order: { updated: 'DESC' },
    });
  }

  async getActivePromotions(currentDate: Date): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(currentDate),
        endDate: MoreThanOrEqual(currentDate),
      },
      relations: ['products'],
      order: { updated: 'DESC' },
    });
  }

  async getPromotion(id: number, withProducts = false): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
      relations: [...(withProducts ? ['products'] : [])],
    });
    if (!promotion) {
      throw new NotFoundError('promotion', 'id', id.toString());
    }
    return promotion;
  }

  async getPromotionBySlug(
    slug: string,
    withProducts = false,
  ): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { slug },
      relations: [...(withProducts ? ['products'] : [])],
    });
    if (!promotion) {
      throw new NotFoundError('promotion', 'slug', slug);
    }
    return promotion;
  }

  async createPromotion(promotionData: PromotionCreateDto): Promise<Promotion> {
    const promotion = new Promotion();
    
    // Generate slug from name
    const slug = promotionData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    Object.assign(promotion, {
      ...promotionData,
      slug, // Override any provided slug with our generated one
    });
    
    if (promotionData.productIds) {
      promotion.products = await this.productsService.getProductsByIds(
        promotionData.productIds,
      );
    }
    return await this.promotionsRepository.save(promotion);
  }

  async updatePromotion(
    id: number,
    promotionData: PromotionUpdateDto,
  ): Promise<Promotion> {
    const promotion = await this.getPromotion(id, true);
    Object.assign(promotion, promotionData);
    if (promotionData.productIds) {
      promotion.products = await this.productsService.getProductsByIds(
        promotionData.productIds,
      );
    }
    return await this.promotionsRepository.save(promotion);
  }

  async deletePromotion(id: number): Promise<boolean> {
    await this.getPromotion(id);
    await this.promotionsRepository.delete({ id });
    return true;
  }

  async getPromotionProducts(
    id: number,
    withHidden?: boolean,
  ): Promise<Product[]> {
    const promotion = await this.getPromotion(id, true);
    if (!withHidden) {
      return promotion.products.filter((product) => product.visible);
    }
    return promotion.products;
  }

  async getPromotionProductsBySlug(
    slug: string,
    withHidden?: boolean,
  ): Promise<Product[]> {
    const promotion = await this.getPromotionBySlug(slug, true);
    if (!withHidden) {
      return promotion.products.filter((product) => product.visible);
    }
    return promotion.products;
  }

  async addPromotionProduct(id: number, productId: number): Promise<Product> {
    const product = await this.productsService.getProduct(productId);
    const promotion = await this.getPromotion(id, true);
    
    // Check if product is already in this promotion
    if (promotion.products.some((p) => p.id === product.id)) {
      throw new ConflictError('product', 'promotion', promotion.name);
    }
    
    // Check if product is already in another active promotion
    if (promotion.isActive) {
      const activePromotions = await this.getActivePromotionsForProduct(
        new Date(),
        productId,
      );
      
      const otherActivePromotions = activePromotions.filter(p => p.id !== id);
      
      if (otherActivePromotions.length > 0) {
        throw new ConflictError(
          'product',
          'activePromotion',
          otherActivePromotions[0].name,
        );
      }
    }
    
    promotion.products.push(product);
    await this.promotionsRepository.save(promotion);
    return product;
  }

  async deletePromotionProduct(
    id: number,
    productId: number,
  ): Promise<boolean> {
    const product = await this.productsService.getProduct(productId);
    const promotion = await this.getPromotion(id, true);
    if (!promotion.products.some((p) => p.id === product.id)) {
      throw new NotRelatedError('promotion', 'product');
    }
    promotion.products = promotion.products.filter((p) => p.id !== product.id);
    await this.promotionsRepository.save(promotion);
    return true;
  }

  async getActivePromotionsForProduct(
    currentDate: Date,
    productId: number,
  ): Promise<Promotion[]> {
    return this.promotionsRepository
      .createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.products', 'product')
      .where('promotion.isActive = :isActive', { isActive: true })
      .andWhere('promotion.startDate <= :currentDate', { currentDate })
      .andWhere('promotion.endDate >= :currentDate', { currentDate })
      .andWhere('product.id = :productId', { productId })
      .getMany();
  }

  async getIdsOfActivePromotions(currentDate: Date): Promise<number[]> {
    const promotions = await this.promotionsRepository.find({
      where: {
        isActive: true,
        startDate: LessThanOrEqual(currentDate),
        endDate: MoreThanOrEqual(currentDate),
      },
      select: ['id'],
    });
    return promotions.map((p) => p.id);
  }

  async getMainActivePromotion(currentDate: Date): Promise<Promotion | null> {
    const promotions = await this.getActivePromotions(currentDate);
    
    if (promotions.length === 0) {
      return null;
    }
    
    // Return the promotion with most products or the most recent one
    return promotions.sort((a, b) => {
      // Sort by number of products (descending)
      const diff = (b.products?.length || 0) - (a.products?.length || 0);
      if (diff !== 0) return diff;
      
      // If tie, sort by creation date (most recent first)
      return b.created.getTime() - a.created.getTime();
    })[0];
  }
} 