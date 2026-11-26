import { TextoObligatorio } from '../../common/validacion';

export class CreateUsoDto {
  @TextoObligatorio('nombre')
  nombre!: string;
}
