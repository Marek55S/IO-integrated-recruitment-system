import { NextResponse } from 'next/server';

import { getFormConfig, getSubmissionConfig } from '@io/content-api/server';

export function GET() {
  try {
    return NextResponse.json({
      form: getFormConfig(),
      submission: getSubmissionConfig(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Nie udało się wczytać konfiguracji formularza.' },
      { status: 500 },
    );
  }
}
