import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CmsSectionKey } from '@prisma/client';

import { PrismaService } from '@/modules/prisma/prisma.service';

import type { BlogPostDto } from './dto/blog-post.dto';
import type { FaqItemDto } from './dto/faq-item.dto';
import type { TestimonialDto } from './dto/testimonial.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Sections (homepage blocks, footer, legal pages) --------------------

  async getSection(key: CmsSectionKey) {
    const section = await this.prisma.cmsSection.findUnique({ where: { key } });
    return section ?? { key, content: {}, updatedAt: null };
  }

  async getAllSections() {
    const sections = await this.prisma.cmsSection.findMany();
    const byKey = Object.fromEntries(sections.map((s) => [s.key, s.content]));
    // Every key returns *something*, even if never edited, so the frontend
    // never has to special-case "not found" for a section.
    return Object.fromEntries(Object.values(CmsSectionKey).map((key) => [key, byKey[key] ?? {}]));
  }

  async upsertSection(key: CmsSectionKey, content: Record<string, unknown>, editorId: string) {
    return this.prisma.cmsSection.upsert({
      where: { key },
      update: { content: content as never, updatedById: editorId },
      create: { key, content: content as never, updatedById: editorId },
    });
  }

  // --- FAQ -----------------------------------------------------------------

  listFaqPublic() {
    return this.prisma.faqItem.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } });
  }

  listFaqAdmin() {
    return this.prisma.faqItem.findMany({ orderBy: { order: 'asc' } });
  }

  createFaq(dto: FaqItemDto) {
    return this.prisma.faqItem.create({ data: { ...dto, order: dto.order ?? 0, isPublished: dto.isPublished ?? true } });
  }

  async updateFaq(id: string, dto: Partial<FaqItemDto>) {
    const existing = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ item not found');
    return this.prisma.faqItem.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    const existing = await this.prisma.faqItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('FAQ item not found');
    return this.prisma.faqItem.delete({ where: { id } });
  }

  // --- Testimonials ----------------------------------------------------------

  listTestimonialsPublic() {
    return this.prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { order: 'asc' } });
  }

  listTestimonialsAdmin() {
    return this.prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  }

  createTestimonial(dto: TestimonialDto) {
    return this.prisma.testimonial.create({
      data: { ...dto, rating: dto.rating ?? 5, order: dto.order ?? 0, isPublished: dto.isPublished ?? true },
    });
  }

  async updateTestimonial(id: string, dto: Partial<TestimonialDto>) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.update({ where: { id }, data: dto });
  }

  async deleteTestimonial(id: string) {
    const existing = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.prisma.testimonial.delete({ where: { id } });
  }

  // --- Blog (content + per-post SEO metadata) ---------------------------------

  async listBlogPublic(page = 1, limit = 10) {
    const where = { isPublished: true };
    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, slug: true, title: true, excerpt: true, coverImageUrl: true, publishedAt: true },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.isPublished) throw new NotFoundException('Blog post not found');
    return post;
  }

  listBlogAdmin() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createBlogPost(dto: BlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('That slug is already in use');
    return this.prisma.blogPost.create({
      data: { ...dto, publishedAt: dto.isPublished ? new Date() : undefined },
    });
  }

  async updateBlogPost(id: string, dto: Partial<BlogPostDto>) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const nowPublishing = dto.isPublished && !existing.isPublished;
    return this.prisma.blogPost.update({
      where: { id },
      data: { ...dto, publishedAt: nowPublishing ? new Date() : existing.publishedAt },
    });
  }

  async deleteBlogPost(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
