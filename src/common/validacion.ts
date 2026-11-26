import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
  applyDecorators,
} from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, ValidationError } from 'class-validator';

// Convierte los errores de class-validator en una lista de mensajes en español.
// Un campo que no tiene decorador (por ejemplo un "id" o un objeto "uso") llega con la
// restricción "whitelistValidation": se lo rechaza porque guardarlo pisaría o cambiaría datos.
function mensajes(errores: ValidationError[]): string[] {
  return errores.flatMap((error) =>
    Object.entries(error.constraints ?? {}).map(([restriccion, mensaje]) => {
      if (restriccion !== 'whitelistValidation') return mensaje;
      return error.property === 'id'
        ? 'el id no se puede enviar en el body'
        : `campo no permitido: ${error.property}`;
    }),
  );
}

// ValidationPipe de toda la app (se registra en main.ts).
export class PipeDeValidacion extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // solo pasan las propiedades que tienen decorador en el DTO...
      forbidNonWhitelisted: true, // ...y si llega otra, responde 400 en vez de ignorarla
      transform: true, // el body pasa a ser una instancia del DTO (hace falta para @Transform)
      stopAtFirstError: true, // un solo mensaje por campo
      exceptionFactory: (errores) => new BadRequestException(mensajes(errores)),
    });
  }

  // Un array no es un objeto JSON válido para ningún DTO de esta API.
  async transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && Array.isArray(value)) {
      throw new BadRequestException('el body debe ser un objeto JSON');
    }
    const validado: unknown = await super.transform(value, metadata);
    return validado;
  }
}

// Campo de texto obligatorio: se recorta (trim) y no puede quedar vacío.
export function TextoObligatorio(campo: string) {
  const message = `${campo} es obligatorio y debe ser un texto no vacío`;
  return applyDecorators(
    Transform(({ value }: { value: unknown }) =>
      typeof value === 'string' ? value.trim() : value,
    ),
    IsString({ message }),
    IsNotEmpty({ message }),
  );
}
