'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminLoginPageClient() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@agh.edu.pl');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Uzupełnij e-mail i hasło.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Logowanie przez backend
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError(loginData.error || 'Nieprawidłowe dane logowania.');
        setIsLoading(false);
        return;
      }

      // Sprawdzamy rolę użytkownika
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        setError('Nie udało się zweryfikować uprawnień.');
        setIsLoading(false);
        return;
      }

      const meData = await meRes.json();
      const adminRoles = ['admin_coordinator', 'program_director', 'cok_staff', 'it_admin'];

      if (!adminRoles.includes(meData.role)) {
        setError('Brak uprawnień administratora. To konto nie ma roli admina.');
        // Usuwamy cookie bo to nie jest admin
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError('Wystąpił błąd podczas połączenia z serwerem.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-amber-500/25 bg-card p-6 shadow-md md:p-8">
        <div className="mb-6 flex gap-2 border-b border-amber-500/20 pb-4">
          <Link
            href="/login"
            className="flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
            Kandydat
          </Link>
          <Link
            href="/admin"
            className="flex-1 rounded-md bg-amber-500/10 px-3 py-1.5 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
            Administrator
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Panel administratora
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-amber-700 dark:text-amber-400">
          Logowanie
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-email">E-mail</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="admin@uczelnia.pl"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Hasło</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600">
            {isLoading ? 'Logowanie...' : 'Zaloguj'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Dane testowe: admin@agh.edu.pl / admin123
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <a
            href="/forgot-password"
            className="text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors text-xs">
            Zapomniałem hasła
          </a>
        </p>
      </section>
    </main>
  );
}
