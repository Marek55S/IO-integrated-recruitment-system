'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


type LoginPageClientProps = {
  validProgramIds: string[];
};

function LoginForm({ validProgramIds }: LoginPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');

  const validProgramId =
    programId && validProgramIds.includes(programId) ? programId : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Uzupelnij e-mail i haslo.');
      return;
    }

    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Nieprawidłowe dane logowania.');
        return;
      }

      // Sprawdzamy czy profil jest kompletny
      let profileComplete = false;
      try {
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          // Sprawdzamy kluczowe pola profilu
          profileComplete = !!(
            profile.birth_date &&
            profile.birth_place &&
            profile.citizenship &&
            profile.phone
          );
        }
      } catch {
        // Jeśli nie uda się sprawdzić, zakładamy niekompletny
      }

      if (profileComplete) {
        // Profil kompletny — strona główna
        router.push('/');
      } else if (validProgramId) {
        // Profil niekompletny, ale wybrał kierunek — formularz z kierunkiem
        router.push(`/form?programId=${validProgramId}`);
      } else {
        // Profil niekompletny — formularz
        router.push('/form');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas połączenia z serwerem.');
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-10">
      <section className="border-primary/15 w-full max-w-md rounded-xl border bg-card p-6 shadow-md md:p-8">
        <div className="mb-6 flex gap-2 border-b pb-4">
          <Link
            href="/login"
            className="flex-1 rounded-md bg-primary/10 px-3 py-1.5 text-center text-sm font-medium text-primary">
            Kandydat
          </Link>
          <Link
            href="/admin"
            className="flex-1 rounded-md px-3 py-1.5 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
            Administrator
          </Link>
        </div>

        <h1 className="text-primary text-2xl font-semibold tracking-tight">
          Logowanie Kandydata
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="twoj@email.pl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Hasło</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" variant="default" className="w-full">
            Zaloguj
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Nie masz konta?{' '}
          <Link
            href={
              validProgramId
                ? `/register?programId=${validProgramId}`
                : '/register'
            }
            className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline">
            Zarejestruj się
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors">
            Zapomniałem hasła
          </Link>
        </p>
      </section>
    </main>
  );
}

export function LoginPageClient(props: LoginPageClientProps) {
  return (
    <Suspense fallback={null}>
      <LoginForm {...props} />
    </Suspense>
  );
}
