'use client';

import { useRouter } from 'next/navigation';

import type { FormConfig, SubmissionConfig } from '@io/content-api';

import { FormEngine } from '@/components/form-engine';

type FormPageClientProps = {
  form: FormConfig;
  submission: SubmissionConfig;
};

export function FormPageClient({ form, submission }: FormPageClientProps) {
  const router = useRouter();

  return (
    <main className="min-h-[calc(100vh-4.25rem)] bg-transparent px-4 py-8 md:px-6 md:py-10">
      <FormEngine
        config={form}
        submissionConfig={submission}
        onSuccessfulSubmit={() => router.push('/')}
      />
    </main>
  );
}
