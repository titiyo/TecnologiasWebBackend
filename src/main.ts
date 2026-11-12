import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Permite que el frontend (otro origen: Netlify o localhost:4200) llame a la API desde el navegador.
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
