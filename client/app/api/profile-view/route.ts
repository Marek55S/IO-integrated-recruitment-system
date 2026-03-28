import { NextResponse } from 'next/server';

import { getProfileViewConfig } from '@io/content-api/server';

export function GET() {
  try {
    const config = getProfileViewConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: 'Nie udało się wczytać konfiguracji profilu.' },
      { status: 500 },
    );
  }
}
