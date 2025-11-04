import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import type { AppConfig } from '@config/app.config';

export async function createTestApp(): Promise<NestFastifyApplication> {
  // Ensure defaults the same as in main.ts

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({
      logger: false, // We'll use Pino logger instead
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app')!;
  const apiBasePath = appConfig.apiBasePath;
  app.setGlobalPrefix(`${apiBasePath}/v1`);

  await app.init();
  // Ensure Fastify has completed plugin registration and routing before tests
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
