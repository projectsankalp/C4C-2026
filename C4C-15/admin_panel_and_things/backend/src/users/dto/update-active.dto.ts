import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateActiveDto {
  @IsNotEmpty({ message: 'Active status is required' })
  @IsBoolean({ message: 'Active status must be a boolean value' })
  active: boolean;
}
