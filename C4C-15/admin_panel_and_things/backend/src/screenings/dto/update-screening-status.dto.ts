import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateScreeningStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['NEW', 'FOLLOW_UP', 'RESOLVED'], {
    message: 'Status must be NEW, FOLLOW_UP, or RESOLVED',
  })
  status: 'NEW' | 'FOLLOW_UP' | 'RESOLVED';
}
