import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

import { FormEngine } from '@/components/form-engine';

export default function FormPage() {
  const config = getFormConfig();
  const submissionConfig = getSubmissionConfig();

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
      <FormEngine config={config} submissionConfig={submissionConfig} />
    </main>
  );
}
