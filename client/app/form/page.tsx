import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

import { FormPageClient } from './form-page-client';
import { getPrograms } from '@/mockedBackend/programs';

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
