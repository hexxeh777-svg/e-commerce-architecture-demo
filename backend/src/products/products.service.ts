import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { MeiliSearch } from 'meilisearch';

export type ProductFilters = {
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  search?: string;
};

@Injectable()
export class ProductsService {
  private meilisearchClient: MeiliSearch;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: any,
    private dataSource: DataSource,
  ) {
    this.meilisearchClient = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_MASTER_KEY || 'master_key',
    });
  }

  async findAll(filters: ProductFilters = {}) {
    const { category, minPrice, maxPrice, limit = 20, offset = 0, search } = filters;

    // Кэшируем результаты популярных запросов
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    let result;

    if (search) {
      // Используем Meilisearch для поиска
      result = await this.searchProducts(search, filters);
    } else {
      // Используем TypeORM для фильтрации
      const queryBuilder = this.productsRepository.createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .offset(offset)
        .limit(limit);

      if (category) {
        queryBuilder.andWhere('product.categoryId = :category', { category });
      }

      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      }

      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      const [items, total] = await queryBuilder.getManyAndCount();

      result = {
        items,
        total,
        limit,
        offset,
      };
    }

    // Кэшируем результат на 60 секунд
    await this.cacheManager.set(cacheKey, result, { ttl: 60 });

    return result;
  }

  async searchProducts(query: string, filters: ProductFilters) {
    try {
      // Для простоты пока без фильтров в Meilisearch
      const searchOptions: any = {
        limit: filters.limit,
        offset: filters.offset,
      };

      const searchResult = await this.meilisearchClient
        .index('products')
        .search(query, searchOptions);

      return {
        items: searchResult.hits,
        total: searchResult.estimatedTotalHits,
        limit: filters.limit,
        offset: filters.offset,
      };
    } catch (error) {
      // Если Meilisearch не доступен, возвращаем базовый поиск
      console.warn('Meilisearch недоступен, используем базовый поиск:', error);
      return this.findAll({ ...filters, search: undefined });
    }
  }

  async findOne(id: number) {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (product) {
      await this.cacheManager.set(cacheKey, product, { ttl: 60 });
    }

    return product;
  }

  async indexProducts() {
    // Индексация всех продуктов в Meilisearch
    const products = await this.productsRepository.find({
      relations: ['category'],
    });

    const formattedProducts = products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price.toString()),
      categoryId: p.categoryId,
      categoryName: p.category?.name,
    }));

    await this.meilisearchClient.index('products').addDocuments(formattedProducts);
  }
}