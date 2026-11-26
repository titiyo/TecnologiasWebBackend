import { IsInt, IsNumber, Max, Min } from 'class-validator';
import { MAX_PRECIO } from '../../common/limites';
import { TextoObligatorio } from '../../common/validacion';

const MENSAJE_PRECIO =
  'precio es obligatorio y debe ser un número mayor o igual a 0';

export class CreateComponenteDto {
  @TextoObligatorio('nombre')
  nombre!: string;

  @TextoObligatorio('tipo')
  tipo!: string;

  @TextoObligatorio('marca')
  marca!: string;

  // La columna es decimal(10, 2): un precio mayor al máximo rompe el INSERT, por eso el @Max.
  @Max(MAX_PRECIO, { message: `precio no puede superar ${MAX_PRECIO}` })
  @Min(0, { message: MENSAJE_PRECIO })
  @IsNumber({}, { message: MENSAJE_PRECIO })
  precio!: number;

  @IsInt({ message: 'usoId es obligatorio y debe ser un número entero' })
  usoId!: number;
}
