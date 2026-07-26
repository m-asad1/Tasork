import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RequestEmailChangeDto {
  @ApiProperty()
  @IsEmail()
  newEmail!: string;

  @ApiProperty({ description: 'Current password, required to authorize the change' })
  @IsString()
  password!: string;
}
