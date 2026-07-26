import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectRequestStatus, ProjectStatus, UserRole, type User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { FilesService } from '@/modules/files/files.service';

import { AddAttachmentDto } from './dto/add-attachment.dto';
import { AssignMemberDto } from './dto/assign-member.dto';
import { CreateProjectRequestDto } from './dto/create-project-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { UpdateProjectRequestDto } from './dto/update-project-request.dto';
import { ProjectsService } from './projects.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly filesService: FilesService,
  ) {}

  // --- Requests ------------------------------------------------------------

  @Post('requests')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit a new project request (the "Get a Custom Solution" form)' })
  async createRequest(
    @CurrentUser() user: User,
    @Body() dto: CreateProjectRequestDto,
    @UploadedFiles() files: MulterFile[] = [],
  ) {
    const uploaded = await Promise.all(files.map((file) => this.filesService.uploadFile(user, file)));
    return this.projectsService.createRequest(user, dto, uploaded.map((f) => f.id));
  }

  @Get('requests')
  @ApiOperation({ summary: "List the current user's project requests, or all requests for staff" })
  listRequests(
    @CurrentUser() user: User,
    @Query('status') status?: ProjectRequestStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    const isStaff = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SUPPORT].includes(user.role);
    return isStaff
      ? this.projectsService.listRequestsForAdmin(status, p, l)
      : this.projectsService.listRequestsForClient(user.id, p, l);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get a single project request with attachments, timeline, and proposals' })
  getRequest(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.getRequestById(id, user);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Edit a request — only while still SUBMITTED (before review begins)' })
  updateRequest(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: UpdateProjectRequestDto) {
    return this.projectsService.updateRequest(id, user, dto);
  }

  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel a pending request' })
  cancelRequest(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.cancelRequest(id, user);
  }

  @Post('requests/:id/archive')
  @ApiOperation({ summary: 'Archive a declined or cancelled request' })
  archiveRequest(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.archiveRequest(id, user);
  }

  @Post('requests/:id/duplicate')
  @ApiOperation({ summary: 'Duplicate a request into a fresh draft' })
  duplicateRequest(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.duplicateRequest(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('requests/:id/review')
  @ApiOperation({ summary: '[Staff] Approve or decline a request' })
  reviewRequest(@Param('id') id: string, @CurrentUser() admin: User, @Body() dto: ReviewRequestDto) {
    return this.projectsService.reviewRequest(id, admin, dto.approve, dto.declineReason);
  }

  @Post('requests/:id/attachments')
  @ApiOperation({ summary: 'Attach an already-uploaded file to a request' })
  addRequestAttachment(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: AddAttachmentDto) {
    return this.projectsService.addAttachment({ requestId: id }, dto.fileAssetId, user);
  }

  @Get('requests/:id/timeline')
  @ApiOperation({ summary: 'Get the activity timeline for a request' })
  getRequestTimeline(@Param('id') id: string) {
    return this.projectsService.getTimeline({ requestId: id });
  }

  // --- Live projects ---------------------------------------------------------

  @Get()
  @ApiOperation({ summary: "List the current client's active projects" })
  listProjects(@CurrentUser() user: User, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.projectsService.listProjectsForClient(user.id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a live project with milestones, assignments, and attachments' })
  getProject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.getProjectById(id, user);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a completed or cancelled project' })
  archiveProject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.archiveProject(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/cancel')
  @ApiOperation({ summary: '[Staff] Cancel an in-progress project' })
  cancelProject(@Param('id') id: string, @CurrentUser() admin: User) {
    return this.projectsService.updateProjectStatus(id, ProjectStatus.CANCELLED, admin, 'Project cancelled by Tasork staff');
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/assignments')
  @ApiOperation({ summary: '[Staff] Assign a team member to a project' })
  assignMember(@Param('id') id: string, @CurrentUser() admin: User, @Body() dto: AssignMemberDto) {
    return this.projectsService.assignMember(id, dto.userId, dto.role, admin);
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Attach an already-uploaded file to a project' })
  addProjectAttachment(@Param('id') id: string, @CurrentUser() user: User, @Body() dto: AddAttachmentDto) {
    return this.projectsService.addAttachment({ projectId: id }, dto.fileAssetId, user);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get the activity timeline for a project' })
  getProjectTimeline(@Param('id') id: string) {
    return this.projectsService.getTimeline({ projectId: id });
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Remove an attachment reference from a project' })
  removeAttachment(@Param('attachmentId') attachmentId: string) {
    // Soft operation: detaches the reference; the underlying FileAsset (and
    // its other attachments, if any) is left intact for audit purposes.
    return this.projectsService.removeAttachmentRef(attachmentId);
  }
}
