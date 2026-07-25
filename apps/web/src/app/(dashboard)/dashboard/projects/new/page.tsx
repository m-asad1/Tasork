import type { Metadata } from 'next';

import { ProjectSubmissionForm } from '@/components/forms/project-submission-form';

export const metadata: Metadata = {
  title: 'Submit a Project',
  description: 'Describe your project and get a custom-reviewed solution from the Tasork team.',
};

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Get a Custom Solution</h1>
        <p className="text-sm text-muted-foreground">Takes about 3 minutes. Your progress is saved automatically.</p>
      </div>
      <ProjectSubmissionForm />
    </div>
  );
}
