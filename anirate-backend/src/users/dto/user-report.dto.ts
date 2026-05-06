import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReportUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;
}

export class PatchUserReportDto {
  @IsBoolean()
  resuelto: boolean;
}
