'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { FormConfig, SubmissionConfig } from '@io/content-api';

import { FormEngine } from '@/components/form-engine';

type FormPageClientProps = {
  form: FormConfig;
  submission: SubmissionConfig;
  validProgramIds: string[];
};

function FormPageInner({ form, submission, validProgramIds }: FormPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');

  const validProgramId =
    programId && validProgramIds.includes(programId) ? programId : null;

  const handleSuccessfulSubmit = () => {
    if (validProgramId) {
      router.push(`/programs/${validProgramId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-[calc(100vh-4.25rem)] bg-transparent px-4 py-8 md:px-6 md:py-10">
      <FormEngine
        config={form}
        submissionConfig={submission}
        onSuccessfulSubmit={handleSuccessfulSubmit}
      />
    </main>
  );
}

export function FormPageClient(props: FormPageClientProps) {
  return (
    <Suspense fallback={null}>
      <FormPageInner {...props} />
    </Suspense>
  );
}
