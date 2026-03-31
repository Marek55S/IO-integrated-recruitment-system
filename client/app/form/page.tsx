import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

import { FormPageClient } from './form-page-client';

export default function FormPage() {
  const form = getFormConfig();
  const submission = getSubmissionConfig();

  return <FormPageClient form={form} submission={submission} />;
}
