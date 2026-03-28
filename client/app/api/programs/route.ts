import { NextResponse } from 'next/server';

import { getProgramsIndex } from '@io/content-api/server';

export function GET() {
  try {
    const data = getProgramsIndex();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Nie udało się wczytać listy kierunków.' },
      { status: 500 },
    );
  }
}
