import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  IsBoolean,
  IsOptional,
  IsIn,
  IsArray,
} from 'class-validator';

export class CreateScreeningDto {
  @IsNotEmpty({ message: 'Patient ID is required' })
  @IsString()
  patientId: string;

  @IsNotEmpty({ message: 'ASHA ID is required' })
  @IsString()
  ashaId: string;

  @IsNotEmpty({ message: 'PHC ID is required' })
  @IsString()
  phcId: string;

  @IsNotEmpty({ message: 'BP Systolic is required' })
  @IsInt({ message: 'BP Systolic must be an integer' })
  @Min(70, { message: 'BP Systolic must be between 70 and 250' })
  @Max(250, { message: 'BP Systolic must be between 70 and 250' })
  bpSystolic: number;

  @IsNotEmpty({ message: 'BP Diastolic is required' })
  @IsInt({ message: 'BP Diastolic must be an integer' })
  @Min(40, { message: 'BP Diastolic must be between 40 and 160' })
  @Max(160, { message: 'BP Diastolic must be between 40 and 160' })
  bpDiastolic: number;

  @IsNotEmpty({ message: 'Sugar level is required' })
  @IsInt({ message: 'Sugar must be an integer' })
  @Min(50, { message: 'Sugar must be between 50 and 600' })
  @Max(600, { message: 'Sugar must be between 50 and 600' })
  sugar: number;

  @IsOptional()
  @IsBoolean()
  familyHistory?: boolean;

  @IsOptional()
  @IsBoolean()
  lowActivity?: boolean;

  @IsOptional()
  @IsBoolean()
  tobaccoUse?: boolean;

  @IsOptional()
  @IsString()
  symptoms?: string;

  @IsNotEmpty({ message: 'Risk level is required' })
  @IsIn(['RED', 'YELLOW', 'GREEN'], {
    message: 'Risk level must be RED, YELLOW, or GREEN',
  })
  riskLevel: 'RED' | 'YELLOW' | 'GREEN';

  @IsNotEmpty({ message: 'Risk reasons are required' })
  @IsArray({ message: 'Risk reasons must be an array of strings' })
  riskReasons: string[];

  @IsOptional()
  @IsBoolean()
  consentGiven?: boolean;
}
