import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'user'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'ecommerce'),
    autoLoadEntities: true,
    synchronize: true, // Только для разработки
  }),
  inject: [ConfigService],
};