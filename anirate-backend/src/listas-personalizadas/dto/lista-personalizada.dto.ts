import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsInt,
  IsNumber,
} from 'class-validator';

export class CreateListaPersonalizadaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagen_portada?: string;

  @IsOptional()
  @IsBoolean()
  publica?: boolean;
}

export class UpdateListaPersonalizadaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imagen_portada?: string;

  @IsOptional()
  @IsBoolean()
  publica?: boolean;
}

export class AddItemDto {
  @IsInt()
  jikan_id: number;

  @IsString()
  titulo: string;

  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  año?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;
}
