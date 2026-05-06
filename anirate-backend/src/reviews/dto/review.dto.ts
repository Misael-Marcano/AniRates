import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  IsIn,
  IsArray,
  ArrayMaxSize,
  IsUrl,
} from 'class-validator';

export class CreateReviewDto {
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

  // Datos de la review
  @IsString()
  comentario: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  puntuacion?: number;

  @IsOptional()
  @IsBoolean()
  es_spoiler?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsUrl({ require_protocol: true }, { each: true })
  imagenes?: string[];
}

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  puntuacion?: number;

  @IsOptional()
  @IsBoolean()
  es_spoiler?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsUrl({ require_protocol: true }, { each: true })
  imagenes?: string[];
}

export class CreateReplyDto {
  @IsString()
  comentario: string;
}

export class UpdateReviewFeaturedDto {
  @IsBoolean()
  featured: boolean;
}

export class ReportReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class PatchReviewReportDto {
  @IsBoolean()
  resuelto: boolean;
}
