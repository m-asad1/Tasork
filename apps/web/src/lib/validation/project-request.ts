import { z } from 'zod';

export const CATEGORY_OPTIONS = [
  'Web & App Development',
  'Design & Branding',
  'Academic & Research',
  'Automation & AI',
  'Business & Documents',
  'Content & Marketing',
  'Other',
] as const;

export const BUDGET_OPTIONS = ['Under $200', '$200 – $500', '$500 – $2,000', '$2,000 – $10,000', 'Over $10,000', 'Not sure yet'] as const;

// Step 1 — What is it
export const projectBasicsSchema = z.object({
  title: z.string().min(5, 'Give your project a short, clear title').max(120),
  category: z.enum(CATEGORY_OPTIONS, { errorMap: () => ({ message: 'Choose a category' }) }),
  description: z.string().min(30, 'Add a bit more detail (at least 30 characters) so we can scope this accurately').max(5000),
});
export type ProjectBasicsInput = z.infer<typeof projectBasicsSchema>;

// Step 2 — Scope & budget
export const projectScopeSchema = z.object({
  budgetRange: z.enum(BUDGET_OPTIONS, { errorMap: () => ({ message: 'Choose an estimated budget range' }) }),
  deadline: z.string().optional(),
  hasExistingMaterials: z.boolean().default(false),
});
export type ProjectScopeInput = z.infer<typeof projectScopeSchema>;

// Step 3 — Files (validated client-side only; server re-validates on upload)
export const projectFilesSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().max(50 * 1024 * 1024, 'Each file must be 50MB or smaller'),
        type: z.string(),
      }),
    )
    .max(10, 'You can attach up to 10 files'),
});
export type ProjectFilesInput = z.infer<typeof projectFilesSchema>;

// Step 4 — Contact confirmation
export const projectContactSchema = z.object({
  contactEmail: z.string().email('Enter a valid email address'),
  agreeToReview: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm before submitting' }),
  }),
});
export type ProjectContactInput = z.infer<typeof projectContactSchema>;

export const fullProjectSchema = projectBasicsSchema
  .merge(projectScopeSchema)
  .merge(projectFilesSchema)
  .merge(projectContactSchema);
export type FullProjectInput = z.infer<typeof fullProjectSchema>;
