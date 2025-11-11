import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';

// Простой массив категорий
const CATEGORIES = [
  { name: 'Электроника', slug: 'electronics' },
  { name: 'Одежда', slug: 'clothing' },
  { name: 'Книги', slug: 'books' },
  { name: 'Дом и сад', slug: 'home-garden' },
  { name: 'Спорт', slug: 'sports' },
];

// Простой массив названий товаров
const PRODUCT_NAMES = [
  'Смартфон', 'Ноутбук', 'Планшет', 'Часы', 'Наушники',
  'Футболка', 'Джинсы', 'Кроссовки', 'Куртка', 'Платье',
  'Роман', 'Учебник', 'Журнал', 'Комикс', 'Справочник',
  'Кресло', 'Стол', 'Лампа', 'Ковер', 'Подушка',
  'Ракетка', 'Мяч', 'Шлем', 'Коньки', 'Скейт',
];

async function generateData() {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ecommerce',
    entities: [Product, Category],
  });

  await AppDataSource.initialize();

  // Создайте категории
  console.log('Создание категорий...');
  for (const cat of CATEGORIES) {
    await AppDataSource.query(
      `INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
      [cat.name, cat.slug]
    );
  }

  // Получите ID категорий
  const categories = await AppDataSource.query('SELECT id FROM categories');
  
  // Создайте 50 000 товаров
  console.log('Начинаем генерацию 50 000 товаров...');
  
  for (let i = 0; i < 50000; i++) {
    const randomName = PRODUCT_NAMES[Math.floor(Math.random() * PRODUCT_NAMES.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomPrice = (Math.random() * 10000).toFixed(2);
    
    await AppDataSource.query(
      `INSERT INTO products (sku, name, description, price, category_id) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        `SKU${i.toString().padStart(6, '0')}`,
        `${randomName} ${i}`,
        `Описание для ${randomName} ${i}`,
        randomPrice,
        randomCategory.id
      ]
    );
    
    // Показываем прогресс каждые 5000 записей
    if ((i + 1) % 5000 === 0) {
      console.log(`Создано ${i + 1} товаров...`);
    }
  }

  console.log('Генерация данных завершена!');
  await AppDataSource.destroy();
}

generateData().catch(error => {
  console.error('Ошибка при генерации данных:', error);
});