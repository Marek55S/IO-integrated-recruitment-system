import {
  getFormConfig,
  getProgramsIndex,
  getSubmissionConfig,
} from '@io/content-api/server';

import { FormPageClient } from './form-page-client';

export default function FormPage() {
  const form = getFormConfig();
  const submission = getSubmissionConfig();
  const { programs } = getProgramsIndex();
  const validProgramIds = programs.map((p) => p.id);

  return (
    <FormPageClient
      form={form}
      submission={submission}
      validProgramIds={validProgramIds}
    />
  );
}
