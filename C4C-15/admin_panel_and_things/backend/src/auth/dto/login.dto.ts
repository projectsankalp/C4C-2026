import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin',
    description: 'User account username',
  })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({ example: 'AdminPass123!', description: 'Plaintext password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
