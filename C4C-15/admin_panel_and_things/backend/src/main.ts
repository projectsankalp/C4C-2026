import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // 1. Configure Express Security Middleware
  app.use(helmet());

  // 2. Enable CORS with Frontend Origin
  const frontendUrl =
    configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  app.enableCors({
    origin: true, // allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Global Input Validation and DTO Transformations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips non-whitelisted payload properties automatically
      transform: true, // auto-transforms payload objects to DTO instance classes
      forbidNonWhitelisted: true, // errors if invalid fields are provided
    }),
  );

  // 4. Global Exception Formatter Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. Bind to Port
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Asha⁺ Backend is running on: http://localhost:${port}`);
}
bootstrap();
