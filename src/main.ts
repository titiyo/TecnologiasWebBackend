import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PipeDeValidacion } from './common/validacion';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Valida el body de todos los POST y PATCH con los decoradores de class-validator de los DTOs.
  app.useGlobalPipes(new PipeDeValidacion());
  // Permite que el frontend (otro origen: Netlify o localhost:4200) llame a la API desde el navegador.
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
