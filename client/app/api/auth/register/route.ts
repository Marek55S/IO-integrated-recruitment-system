// import { NextResponse } from 'next/server';
// import { pool } from '@/lib/db';
// import { hashPassword, encryptSensitiveData } from '@/lib/auth-utils';
//
// export async function POST(req: Request) {
//   try {
//     const { email, password, firstName, lastName, pesel } = await req.json();
//
//     if (!email || !password || !firstName || !lastName) {
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }
//
//
//     const passwordHash = await hashPassword(password);
//     const encryptedPesel = pesel ? encryptSensitiveData(pesel) : null;
//
//     const client = await pool.connect();
//     try {
//       await client.query('BEGIN');
//
//       const userRes = await client.query(
//         'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
//         [email, passwordHash, 'candidate']
//       );
//
//       const userId = userRes.rows[0].id;
//
//       await client.query(
//         'INSERT INTO candidate_profiles (user_id, first_name, last_name, pesel) VALUES ($1, $2, $3, $4)',
//         [userId, firstName, lastName, encryptedPesel]
//       );
//
//       await client.query('COMMIT');
//       return NextResponse.json({ message: 'User registered', userId }, { status: 201 });
//     } catch (dbError: any) {
//       await client.query('ROLLBACK');
//       if (dbError.code === '23505') {
//         return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
//       }
//       throw dbError;
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error('Registration error:', error);
//     return NextResponse.json({ error: 'System error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { detail: text || 'Registration failed' };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Registration failed' },
        { status: response.status },
      );
    }

    // Auto-login after successful registration
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.access_token;

      const res = NextResponse.json(
        { message: data.message },
        { status: 201 },
      );

      res.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return res;
    }

    // Fallback: registration succeeded but auto-login failed
    return NextResponse.json({ message: data.message }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}
