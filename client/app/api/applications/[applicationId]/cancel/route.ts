import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const { applicationId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(`${apiUrl}/applications/${applicationId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
