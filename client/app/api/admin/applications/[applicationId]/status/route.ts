import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> },
) {
  try {
    const { applicationId } = await params;
    const token = request.headers
      .get('cookie')
      ?.split('auth_token=')[1]
      ?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const body = await request.json();
    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    const response = await fetch(
      `${apiUrl}/admin/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Błąd zmiany statusu' },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[PATCH status] Błąd:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

