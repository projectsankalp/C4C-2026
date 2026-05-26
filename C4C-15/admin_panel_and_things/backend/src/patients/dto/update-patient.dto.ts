import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer' })
  @Min(18, { message: 'Age must be at least 18' })
  @Max(120, { message: 'Age must be at most 120' })
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;
}
