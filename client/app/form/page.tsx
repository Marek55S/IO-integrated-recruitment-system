import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

import { getPrograms } from '@/mockedBackend/programs';

import { FormPageClient } from './form-page-client';

export default function FormPage() {
  const form = getFormConfig();
  const submission = getSubmissionConfig();
  const validProgramIds = getPrograms().map((p) => p.id);

  return (
    <FormPageClient
      form={form}
      submission={submission}
      validProgramIds={validProgramIds}
    />
  );
}
