import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

export async function GET() {
  const res = await fetch(`${API_URL}/surveys/active`, { cache: 'no-store' });
  if (!res.ok) return NextResponse.json(null);
  const data = await res.json();
  return NextResponse.json(data);
}
