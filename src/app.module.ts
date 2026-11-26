import { existsSync } from 'node:fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsosModule } from './usos/usos.module';
import { ComponentesModule } from './componentes/componentes.module';

// En desarrollo las variables salen del archivo .env (ignorado por git, ver .env.example).
// En Render no hay .env: las variables se cargan en el panel Environment y ya llegan en process.env.
if (existsSync('.env') && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile('.env');
}

// La contraseña de la base no tiene valor por defecto: tiene que venir del entorno.
function variableObligatoria(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Definila en el archivo .env (ver .env.example).`,
    );
  }
  return valor;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: variableObligatoria('DB_PASSWORD'),
      database: process.env.DB_NAME ?? 'pc_prearmadas',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsosModule,
    ComponentesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
