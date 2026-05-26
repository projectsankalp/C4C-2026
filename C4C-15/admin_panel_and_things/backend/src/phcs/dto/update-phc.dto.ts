import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePhcDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
