// import { NextResponse } from 'next/server';
// import { pool } from '@/lib/db';
// import { verifyPassword, signJwt } from '@/lib/auth-utils';
//
// export async function POST(req: Request) {
//   try {
//     const { email, password } = await req.json();
//
//     if (!email || !password) {
//       return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
//     }
//
//     const { rows } = await pool.query(
//       'SELECT id, email, password_hash, role FROM users WHERE email = $1 AND is_active = true',
//        [email]
//     );
//
//     if (rows.length === 0) {
//       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }
//
//     const user = rows[0];
//     const isPasswordValid = await verifyPassword(password, user.password_hash);
//
//     if (!isPasswordValid) {
//       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
//     }
//
//     const token = await signJwt({
//       sub: user.id,
//       email: user.email,
//       role: user.role
//     });
//
//     const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
//
//
//     response.cookies.set({
//       name: 'auth_token',
//       value: token,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 24
//     });
//
//     return response;
//   } catch (error) {
//     console.error('Login error:', error);
//     return NextResponse.json({ error: 'System error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiUrl = process.env.API_URL || 'http://127.0.0.1:8000/api/v1';

    const response = await fetch(`${apiUrl}/auth/login`, {
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
      data = { detail: text || 'Invalid credentials' };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Invalid credentials' },
        { status: response.status },
      );
    }

    const token = data.access_token;
    const res = NextResponse.json(
      { message: 'Login successful' },
      { status: 200 },
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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}
