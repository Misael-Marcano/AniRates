import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportContenidoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsIn(['anime', 'manga', 'ANIME', 'MANGA'])
  tipo: string;
}

export class PatchContenidoReportDto {
  @IsBoolean()
  resuelto: boolean;
}
