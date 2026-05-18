import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(`${apiUrl}/programs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Błąd pobierania kierunków z backendu' },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Błąd proxy /programs:', error);
    return NextResponse.json(
      { error: 'Błąd połączenia z serwerem' },
      { status: 500 },
    );
  }
}
