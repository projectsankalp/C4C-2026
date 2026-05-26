import {
  IsNotEmpty,
  IsIn,
  MinLength,
  IsOptional,
  IsString,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['DOCTOR', 'ASHA'], { message: 'Role must be DOCTOR or ASHA' })
  role: 'DOCTOR' | 'ASHA';

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

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
