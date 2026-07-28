import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CmsSectionKey, UserRole, type User } from '@prisma/client';

import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';

import { BlogPostDto } from './dto/blog-post.dto';
import { FaqItemDto } from './dto/faq-item.dto';
import { TestimonialDto } from './dto/testimonial.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { CmsService } from './cms.service';

@ApiTags('cms')
@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // --- Public read routes (marketing site) --------------------------------

  @Public()
  @Get('cms/sections')
  @ApiOperation({ summary: 'Get all CMS sections (homepage blocks, footer, legal pages)' })
  getAllSections() {
    return this.cmsService.getAllSections();
  }

  @Public()
  @Get('cms/sections/:key')
  @ApiOperation({ summary: 'Get a single CMS section by key' })
  getSection(@Param('key') key: CmsSectionKey) {
    return this.cmsService.getSection(key);
  }

  @Public()
  @Get('cms/faq')
  @ApiOperation({ summary: 'List published FAQ items' })
  listFaqPublic() {
    return this.cmsService.listFaqPublic();
  }

  @Public()
  @Get('cms/testimonials')
  @ApiOperation({ summary: 'List published testimonials' })
  listTestimonialsPublic() {
    return this.cmsService.listTestimonialsPublic();
  }

  @Public()
  @Get('cms/blog')
  @ApiOperation({ summary: 'List published blog posts' })
  listBlogPublic(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.cmsService.listBlogPublic(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  @Public()
  @Get('cms/blog/:slug')
  @ApiOperation({ summary: 'Get a published blog post by slug (includes SEO metadata)' })
  getBlogPost(@Param('slug') slug: string) {
    return this.cmsService.getBlogPostBySlug(slug);
  }

  // --- Staff write routes ----------------------------------------------------

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('admin/cms/sections/:key')
  @ApiOperation({ summary: '[Staff] Update a CMS section' })
  upsertSection(@Param('key') key: CmsSectionKey, @Body() dto: UpdateSectionDto, @CurrentUser() editor: User) {
    return this.cmsService.upsertSection(key, dto.content, editor.id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/cms/faq')
  @ApiOperation({ summary: '[Staff] List all FAQ items (including unpublished)' })
  listFaqAdmin() {
    return this.cmsService.listFaqAdmin();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/cms/faq')
  @ApiOperation({ summary: '[Staff] Create an FAQ item' })
  createFaq(@Body() dto: FaqItemDto) {
    return this.cmsService.createFaq(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/cms/faq/:id')
  @ApiOperation({ summary: '[Staff] Update an FAQ item' })
  updateFaq(@Param('id') id: string, @Body() dto: Partial<FaqItemDto>) {
    return this.cmsService.updateFaq(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/cms/faq/:id')
  @ApiOperation({ summary: '[Staff] Delete an FAQ item' })
  deleteFaq(@Param('id') id: string) {
    return this.cmsService.deleteFaq(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/cms/testimonials')
  @ApiOperation({ summary: '[Staff] List all testimonials (including unpublished)' })
  listTestimonialsAdmin() {
    return this.cmsService.listTestimonialsAdmin();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/cms/testimonials')
  @ApiOperation({ summary: '[Staff] Create a testimonial' })
  createTestimonial(@Body() dto: TestimonialDto) {
    return this.cmsService.createTestimonial(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/cms/testimonials/:id')
  @ApiOperation({ summary: '[Staff] Update a testimonial' })
  updateTestimonial(@Param('id') id: string, @Body() dto: Partial<TestimonialDto>) {
    return this.cmsService.updateTestimonial(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/cms/testimonials/:id')
  @ApiOperation({ summary: '[Staff] Delete a testimonial' })
  deleteTestimonial(@Param('id') id: string) {
    return this.cmsService.deleteTestimonial(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/cms/blog')
  @ApiOperation({ summary: '[Staff] List all blog posts (including drafts)' })
  listBlogAdmin() {
    return this.cmsService.listBlogAdmin();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/cms/blog')
  @ApiOperation({ summary: '[Staff] Create a blog post' })
  createBlogPost(@Body() dto: BlogPostDto) {
    return this.cmsService.createBlogPost(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('admin/cms/blog/:id')
  @ApiOperation({ summary: '[Staff] Update a blog post (including publish/unpublish)' })
  updateBlogPost(@Param('id') id: string, @Body() dto: Partial<BlogPostDto>) {
    return this.cmsService.updateBlogPost(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('admin/cms/blog/:id')
  @ApiOperation({ summary: '[Staff] Delete a blog post' })
  deleteBlogPost(@Param('id') id: string) {
    return this.cmsService.deleteBlogPost(id);
  }
}
