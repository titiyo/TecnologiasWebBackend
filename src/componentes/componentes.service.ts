import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateComponenteDto } from './dto/create-componente.dto';
import { UpdateComponenteDto } from './dto/update-componente.dto';
import { Componente } from './entities/componente.entity';
import { UsosService } from '../usos/usos.service';
import { MAX_ID } from '../common/limites';

// La columna precio guarda 2 decimales: se redondea antes de guardar para que la respuesta
// coincida con lo que queda en la base.
const redondear = (precio: number) => Math.round(precio * 100) / 100;

@Injectable()
export class ComponentesService {
  constructor(
    @InjectRepository(Componente)
    private readonly componentesRepository: Repository<Componente>,
    private readonly usosService: UsosService,
  ) {}

  async create(createComponenteDto: CreateComponenteDto) {
    const { usoId, ...rest } = createComponenteDto;
    await this.usosService.findOne(usoId);
    const nuevoComponente = this.componentesRepository.create({
      ...rest,
      precio: redondear(rest.precio),
      uso: { id: usoId },
    });
    return this.componentesRepository.save(nuevoComponente);
  }

  async findAll(usoId?: number, nombre?: string) {
    const where: FindOptionsWhere<Componente> = {};
    if (usoId !== undefined) {
      // Un id fuera de rango no puede existir: el filtro no encuentra nada (y no llega a la base).
      if (usoId < 1 || usoId > MAX_ID) return [];
      where.uso = { id: usoId };
    }
    if (nombre) {
      where.nombre = ILike(`%${nombre}%`);
    }
    return this.componentesRepository.find({
      relations: { uso: true },
      where,
    });
  }

  async findOne(id: number) {
    const componente =
      id > MAX_ID
        ? null
        : await this.componentesRepository.findOne({
            where: { id },
            relations: { uso: true },
          });
    if (!componente) {
      throw new NotFoundException(`El componente con ID ${id} no existe.`);
    }
    return componente;
  }

  async update(id: number, updateComponenteDto: UpdateComponenteDto) {
    // PartialType deja que un campo falte, pero también deja pasar un null: no tiene sentido guardarlo.
    if (Object.values(updateComponenteDto).some((valor) => valor === null)) {
      throw new BadRequestException('los campos no pueden ser null');
    }
    const { usoId, ...rest } = updateComponenteDto;
    if (usoId !== undefined) {
      await this.usosService.findOne(usoId);
    }
    const componente = await this.findOne(id);
    Object.assign(componente, rest);
    if (rest.precio !== undefined) {
      componente.precio = redondear(rest.precio);
    }
    if (usoId !== undefined) {
      componente.uso = { id: usoId } as Componente['uso'];
    }
    return this.componentesRepository.save(componente);
  }

  async remove(id: number) {
    const result =
      id > MAX_ID
        ? { affected: 0 }
        : await this.componentesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`El componente con ID ${id} no existe.`);
    }
    return {
      message: `El componente con ID ${id} ha sido eliminado.`,
      status: 'success',
    };
  }
}
