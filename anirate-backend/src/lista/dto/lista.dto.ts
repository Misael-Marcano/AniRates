import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { LISTA_ESTADOS } from '../../database/entities';
import type { ListaEstado } from '../../database/entities';

export class UpsertListaDto {
  // Contenido metadata for upsert
  @IsNumber()
  jikan_id: number;

  @IsString()
  titulo: string;

  @IsIn(['ANIME', 'MANGA'])
  tipo: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  año?: number;

  @IsOptional()
  @IsString()
  estado_contenido?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // Lista fields
  @IsIn(LISTA_ESTADOS as unknown as string[])
  estado: ListaEstado;

  @IsOptional()
  @IsNumber()
  @Min(0)
  progreso?: number;

  @IsOptional()
  @IsString()
  nota_personal?: string;
}

export class UpdateListaDto {
  @IsOptional()
  @IsIn(LISTA_ESTADOS as unknown as string[])
  estado?: ListaEstado;

  @IsOptional()
  @IsNumber()
  @Min(0)
  progreso?: number;

  @IsOptional()
  @IsString()
  nota_personal?: string;
}
