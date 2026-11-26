import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  BadRequestException,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsosService } from './usos.service';
import { CreateUsoDto } from './dto/create-uso.dto';
import { UpdateUsoDto } from './dto/update-uso.dto';

@Controller('usos')
export class UsosController {
  constructor(private readonly usosService: UsosService) {}

  // Dos usos son el mismo si sus nombres coinciden sin contar espacios ni mayúsculas.
  private normalizar(nombre: string) {
    return nombre.trim().toLowerCase();
  }

  // El body ya llega validado por el ValidationPipe global (ver CreateUsoDto): nombre es un texto
  // no vacío y ya viene recortado. Acá solo queda la regla de negocio: que no esté repetido.
  @Post()
  async create(@Body() createUsoDto: CreateUsoDto) {
    const nombre = createUsoDto.nombre;
    const usos = await this.usosService.findAll();
    const existingUso = usos.find(
      (uso) => this.normalizar(uso.nombre) === this.normalizar(nombre),
    );
    if (existingUso) {
      throw new ConflictException(`El uso con nombre "${nombre}" ya existe.`);
    }
    return this.usosService.create(createUsoDto);
  }

  @Get()
  findAll(@Query('nombre') nombre?: string) {
    return this.usosService.findAll(nombre);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsoDto: UpdateUsoDto,
  ) {
    // PartialType deja que el campo falte, pero también deja pasar un null: acá no tiene sentido.
    if ((updateUsoDto.nombre as unknown) === null) {
      throw new BadRequestException('nombre no puede ser null');
    }
    if (updateUsoDto.nombre !== undefined) {
      const nombre = updateUsoDto.nombre;
      const usos = await this.usosService.findAll();
      const existingUso = usos.find(
        (uso) =>
          this.normalizar(uso.nombre) === this.normalizar(nombre) &&
          uso.id !== id,
      );
      if (existingUso) {
        throw new ConflictException(`El uso con nombre "${nombre}" ya existe.`);
      }
    }
    return this.usosService.update(id, updateUsoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usosService.remove(id);
  }
}
