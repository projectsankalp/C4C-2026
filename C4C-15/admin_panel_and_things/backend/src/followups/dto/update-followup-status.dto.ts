import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateFollowupStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['PENDING', 'DONE'], { message: 'Status must be PENDING or DONE' })
  status: 'PENDING' | 'DONE';
}
