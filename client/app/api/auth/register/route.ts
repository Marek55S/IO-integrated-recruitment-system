import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword, encryptSensitiveData } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, pesel } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

  
    const passwordHash = await hashPassword(password);
    const encryptedPesel = pesel ? encryptSensitiveData(pesel) : null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
        [email, passwordHash, 'candidate']
      );
      
      const userId = userRes.rows[0].id;

      await client.query(
        'INSERT INTO candidate_profiles (user_id, first_name, last_name, pesel) VALUES ($1, $2, $3, $4)',
        [userId, firstName, lastName, encryptedPesel]
      );

      await client.query('COMMIT');
      return NextResponse.json({ message: 'User registered', userId }, { status: 201 });
    } catch (dbError: any) {
      await client.query('ROLLBACK');
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      throw dbError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'System error' }, { status: 500 });
  }
}