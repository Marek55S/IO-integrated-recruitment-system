import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const userId = '9ffe61cb-a17d-403b-bd12-758052f549b8';

    if (false) { // TODO: zastąpić logiką sprawdzającą sesję
      return NextResponse.json({ error: 'Auth error' }, { status: 401 });
    }

    const sql = `
      SELECT 
        pa.id AS application_id,
        pa.status,
        pa.submitted_at,
        p.name AS program_name,
        pe.edition_name
      FROM program_applications pa
      JOIN program_editions pe ON pa.edition_id = pe.id
      JOIN programs p ON pe.program_id = p.id
      WHERE pa.user_id = $1
      ORDER BY pa.updated_at DESC;
    `;

    const result = await query(sql, [userId]);

    return NextResponse.json({ applications: result.rows }, { status: 200 });
  } catch (error) {
    console.error('[GET my-applications] Błąd:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
