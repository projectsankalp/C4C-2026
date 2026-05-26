import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreatePatientDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Age is required' })
  @IsInt({ message: 'Age must be an integer' })
  @Min(18, { message: 'Age must be at least 18' })
  @Max(120, { message: 'Age must be at most 120' })
  age: number;

  @IsNotEmpty({ message: 'Gender is required' })
  @IsString()
  gender: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'Village is required' })
  @IsString()
  village: string;

  @IsOptional()
  @IsString()
  houseNumber?: string;
}
