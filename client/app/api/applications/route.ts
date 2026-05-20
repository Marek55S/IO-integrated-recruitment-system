// import { NextResponse } from 'next/server';
// import { query } from '@/lib/db';
//
// export async function GET(request: Request) {
//   try {
//     const userId = '9ffe61cb-a17d-403b-bd12-758052f549b8';
//
//     if (false) { // TODO: zastąpić logiką sprawdzającą sesję
//       return NextResponse.json({ error: 'Auth error' }, { status: 401 });
//     }
//
//     const sql = `
//       SELECT
//         pa.id AS application_id,
//         pa.status,
//         pa.submitted_at,
//         p.name AS program_name,
//         pe.edition_name
//       FROM program_applications pa
//       JOIN program_editions pe ON pa.edition_id = pe.id
//       JOIN programs p ON pe.program_id = p.id
//       WHERE pa.user_id = $1
//       ORDER BY pa.updated_at DESC;
//     `;
//
//     const result = await query(sql, [userId]);
//
//     return NextResponse.json({ applications: result.rows }, { status: 200 });
//   } catch (error) {
//     console.error('[GET my-applications] Błąd:', error);
//     return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split('auth_token=')[1]
      ?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Auth error' }, { status: 401 });
    }

    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    const response = await fetch(`${apiUrl}/applications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Błąd pobierania danych' },
        { status: response.status },
      );
    }

    const applications = await response.json();
    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error('[GET my-applications] Błąd:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get('cookie')
      ?.split('auth_token=')[1]
      ?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const body = await request.json();
    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    const response = await fetch(`${apiUrl}/applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Błąd zapisu' },
        { status: response.status },
      );
    }

    // Automatycznie zmieniamy status na submitted, żeby admin widział wniosek
    await fetch(`${apiUrl}/applications/${data.id}/submit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST applications] Błąd:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
