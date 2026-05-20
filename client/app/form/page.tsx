import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

import { FormPageClient } from './form-page-client';

async function getPrograms() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/programs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Błąd pobierania kierunków:', error);
    return [];
  }
}

export default async function FormPage() {
  const form = getFormConfig();
  const submission = getSubmissionConfig();
  const programs = await getPrograms();
  const validProgramIds = programs.map((p: any) => p.id);

  return (
    <FormPageClient
      form={form}
      submission={submission}
      validProgramIds={validProgramIds}
    />
  );
}
