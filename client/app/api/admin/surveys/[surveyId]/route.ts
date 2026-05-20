import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

function getToken(req: Request): string | null {
  const match = req.headers.get('cookie')?.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ surveyId: string }> },
) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { surveyId } = await params;
  const res = await fetch(`${API_URL}/admin/surveys/${surveyId}/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ surveyId: string }> },
) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { surveyId } = await params;
  const res = await fetch(`${API_URL}/admin/surveys/${surveyId}/activate`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
