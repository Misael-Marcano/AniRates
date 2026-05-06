import { IsBoolean } from 'class-validator';

export class SetShadowbanDto {
  @IsBoolean()
  shadowbanned: boolean;
}
