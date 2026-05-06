import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateFavoriteDto {
  // Jikan MAL ID + metadata para upsert automático del contenido
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
}
