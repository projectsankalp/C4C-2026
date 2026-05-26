import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePhcDto {
  @IsNotEmpty({ message: 'PHC name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'District is required' })
  @IsString()
  district: string;

  @IsNotEmpty({ message: 'State is required' })
  @IsString()
  state: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
