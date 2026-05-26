import { IsOptional, IsString } from 'class-validator';

export class CreateFollowupDto {
  @IsOptional()
  @IsString()
  assignedToAshaId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
