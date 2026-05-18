import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  const { applicationId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') ?? 'student_status';

  const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(
    `${apiUrl}/applications/${applicationId}/document?type=${type}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Błąd generowania dokumentu' }));
    return NextResponse.json(err, { status: res.status });
  }

  const pdfBuffer = await res.arrayBuffer();
  const contentDisposition = res.headers.get('content-disposition') ?? `attachment; filename="dokument.pdf"`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDisposition,
    },
  });
}
