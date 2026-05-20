import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

function getToken(req: Request): string | null {
  const match = req.headers.get('cookie')?.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function GET(req: Request) {
  const token = getToken(req);
  if (!token) return NextResponse.json([], { status: 401 });

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get('unread_only') === 'true';

  const res = await fetch(
    `${API_URL}/notifications${unreadOnly ? '?unread_only=true' : ''}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
  );

  if (!res.ok) return NextResponse.json([], { status: res.status });
  return NextResponse.json(await res.json());
}
