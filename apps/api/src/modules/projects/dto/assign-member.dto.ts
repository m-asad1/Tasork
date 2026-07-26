import { ApiProperty } from '@nestjs/swagger';
import { ProjectRole } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class AssignMemberDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: ProjectRole, default: ProjectRole.CONTRIBUTOR })
  @IsEnum(ProjectRole)
  role!: ProjectRole;
}
