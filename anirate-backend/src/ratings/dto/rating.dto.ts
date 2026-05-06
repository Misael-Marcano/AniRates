import {
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export class CreateRatingDto {
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
  estado?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  puntuacion: number;
}
