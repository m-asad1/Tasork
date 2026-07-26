'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, Input } from '@tasork/ui';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { FileDropzone } from '@/components/forms/file-dropzone';
import { StepProgress } from '@/components/forms/step-progress';
import type { Step } from '@/components/forms/step-progress';
import { apiClient } from '@/lib/api-client';
import {
  BUDGET_OPTIONS,
  CATEGORY_OPTIONS,
  type ProjectBasicsInput,
  type ProjectContactInput,
  type ProjectScopeInput,
  projectBasicsSchema,
  projectContactSchema,
  projectScopeSchema,
} from '@/lib/validation/project-request';
import { useAuthStore } from '@/store/auth-store';
import { useProjectSubmissionStore } from '@/store/project-submission-store';

const STEPS: Step[] = [{ label: 'Project' }, { label: 'Scope' }, { label: 'Files' }, { label: 'Confirm' }];

export function ProjectSubmissionForm() {
  const router = useRouter();
  const draft = useProjectSubmissionStore();
  const { user } = useAuthStore();
  const [files, setFiles] = React.useState<File[]>([]);
  const [fileError, setFileError] = React.useState<string>();

  const basicsForm = useForm<ProjectBasicsInput>({
    resolver: zodResolver(projectBasicsSchema),
    defaultValues: { title: draft.title, category: draft.category as ProjectBasicsInput['category'], description: draft.description },
  });

  const scopeForm = useForm<ProjectScopeInput>({
    resolver: zodResolver(projectScopeSchema),
    defaultValues: {
      budgetRange: draft.budgetRange as ProjectScopeInput['budgetRange'],
      deadline: draft.deadline,
      hasExistingMaterials: draft.hasExistingMaterials,
    },
  });

  const contactForm = useForm<ProjectContactInput>({
    resolver: zodResolver(projectContactSchema),
    defaultValues: { contactEmail: draft.contactEmail || user?.email || '', agreeToReview: undefined },
  });

  // Autosave every field change into the persisted store.
  React.useEffect(() => {
    const sub = basicsForm.watch((values) => {
      if (values.title !== undefined) draft.setField('title', values.title);
      if (values.category !== undefined) draft.setField('category', values.category);
      if (values.description !== undefined) draft.setField('description', values.description);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basicsForm]);

  React.useEffect(() => {
    const sub = scopeForm.watch((values) => {
      if (values.budgetRange !== undefined) draft.setField('budgetRange', values.budgetRange);
      if (values.deadline !== undefined) draft.setField('deadline', values.deadline ?? '');
      if (values.hasExistingMaterials !== undefined) draft.setField('hasExistingMaterials', values.hasExistingMaterials);
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeForm]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', basicsForm.getValues('title'));
      formData.append('category', basicsForm.getValues('category'));
      formData.append('description', basicsForm.getValues('description'));
      formData.append('budgetRange', scopeForm.getValues('budgetRange'));
      formData.append('deadline', scopeForm.getValues('deadline') ?? '');
      formData.append('contactEmail', contactForm.getValues('contactEmail'));
      files.forEach((file) => formData.append('files', file));

      return apiClient.post('/projects/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      draft.reset();
      router.push('/dashboard/projects?submitted=1');
    },
  });

  function next() {
    draft.setStep(Math.min(draft.step + 1, STEPS.length - 1));
  }
  function back() {
    draft.setStep(Math.max(draft.step - 1, 0));
  }

  async function handleStepSubmit() {
    if (draft.step === 0) {
      const valid = await basicsForm.trigger();
      if (valid) next();
    } else if (draft.step === 1) {
      const valid = await scopeForm.trigger();
      if (valid) next();
    } else if (draft.step === 2) {
      if (files.length > 10) {
        setFileError('You can attach up to 10 files');
        return;
      }
      setFileError(undefined);
      next();
    } else {
      const valid = await contactForm.trigger();
      if (valid) submitMutation.mutate();
    }
  }

  if (submitMutation.isSuccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <CheckCircle2 className="h-14 w-14 text-success" />
          <h2 className="font-display text-2xl font-bold">Your Solution request is in review</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            We&apos;ll review your project and send a custom proposal — usually within 24 hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <StepProgress steps={STEPS} currentStep={draft.step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={draft.step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {draft.step === 0 && (
              <div className="space-y-4">
                <Input
                  label="Project title"
                  placeholder="e.g. Redesign my portfolio website"
                  error={basicsForm.formState.errors.title?.message}
                  {...basicsForm.register('title')}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...basicsForm.register('category')}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {basicsForm.formState.errors.category && (
                    <p className="text-xs font-medium text-destructive">{basicsForm.formState.errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Describe your project</label>
                  <textarea
                    rows={6}
                    placeholder="What do you need done? Include any requirements, references, or constraints."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...basicsForm.register('description')}
                  />
                  {basicsForm.formState.errors.description && (
                    <p className="text-xs font-medium text-destructive">{basicsForm.formState.errors.description.message}</p>
                  )}
                </div>
              </div>
            )}

            {draft.step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Estimated budget</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...scopeForm.register('budgetRange')}
                  >
                    <option value="">Select a range</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {scopeForm.formState.errors.budgetRange && (
                    <p className="text-xs font-medium text-destructive">{scopeForm.formState.errors.budgetRange.message}</p>
                  )}
                </div>
                <Input label="Deadline (optional)" type="date" {...scopeForm.register('deadline')} />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 rounded border-input" {...scopeForm.register('hasExistingMaterials')} />
                  I have existing files, brand assets, or materials to share
                </label>
              </div>
            )}

            {draft.step === 2 && <FileDropzone files={files} onChange={setFiles} error={fileError} />}

            {draft.step === 3 && (
              <div className="space-y-4">
                <Input
                  label="Contact email"
                  type="email"
                  error={contactForm.formState.errors.contactEmail?.message}
                  {...contactForm.register('contactEmail')}
                />
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">{basicsForm.getValues('title') || 'Untitled project'}</p>
                  <p className="mt-1 text-muted-foreground">{basicsForm.getValues('category')}</p>
                  <p className="mt-2 text-muted-foreground">{files.length} file(s) attached</p>
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" {...contactForm.register('agreeToReview')} />
                  I understand my project will be manually reviewed and I&apos;ll receive a custom proposal before any work begins.
                </label>
                {contactForm.formState.errors.agreeToReview && (
                  <p className="text-xs font-medium text-destructive">{contactForm.formState.errors.agreeToReview.message}</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={draft.step === 0}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleStepSubmit} loading={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : draft.step === STEPS.length - 1 ? (
              'Submit Request'
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {submitMutation.isError && (
          <p className="mt-3 text-center text-sm font-medium text-destructive">
            Something went wrong submitting your request. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
