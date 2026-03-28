import { NextResponse } from 'next/server';

import { getProgramPageById } from '@io/content-api/server';

type RouteContext = {
  params: Promise<{ programId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { programId } = await context.params;
  const page = getProgramPageById(programId);

  if (!page) {
    return NextResponse.json({ error: 'Nie znaleziono kierunku.' }, { status: 404 });
  }

  return NextResponse.json(page);
}
