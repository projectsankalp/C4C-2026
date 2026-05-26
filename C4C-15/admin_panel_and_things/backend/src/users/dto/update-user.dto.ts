import {
  IsEmail,
  IsOptional,
  IsString,
  IsIn,
  MinLength,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsOptional()
  @IsIn(['DOCTOR', 'ASHA'], { message: 'Role must be DOCTOR or ASHA' })
  role?: 'DOCTOR' | 'ASHA';

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  phcId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'RESTRICTED'])
  status?: string;
}
