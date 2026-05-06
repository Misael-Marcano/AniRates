import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateContenidoDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  año?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsIn(['ANIME', 'MANGA'])
  tipo: string;

  @IsOptional()
  generoIds?: number[];
}

export class UpdateContenidoDto extends CreateContenidoDto {}
