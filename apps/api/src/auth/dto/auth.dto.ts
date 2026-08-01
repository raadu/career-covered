import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const PASSWORD_RULES = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'My Name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'MySecure1',
    description: 'At least 1 capital letter, 1 number, 6+ characters',
  })
  @IsString()
  @MinLength(6)
  @Matches(PASSWORD_RULES, {
    message:
      'Password must include at least 1 capital letter, 1 number, and be 6+ characters',
  })
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'my-secure-password' })
  @IsString()
  password: string;
}
