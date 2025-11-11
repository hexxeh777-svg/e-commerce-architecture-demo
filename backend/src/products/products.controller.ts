import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ProductsService, ProductFilters } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category', new ParseIntPipe({ optional: true })) category?: number,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
    @Query('search') search?: string,
  ) {
    const filters: ProductFilters = {
      category,
      minPrice,
      maxPrice,
      limit,
      offset,
      search,
    };

    return await this.productsService.findAll(filters);
  }

  @Get('/index') // <-- Этот маршрут должен быть
  async indexAllProducts() {
    await this.productsService.indexProducts();
    return { message: 'Индексация завершена' };
  }
}