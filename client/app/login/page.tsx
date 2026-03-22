'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Uzupełnij e-mail i hasło.');
      return;
    }

    setError(null);
    router.push('/form');
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold">Logowanie</h1>

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

          <Button type="submit" variant="destructive" className="w-full">
            Zaloguj
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Nie masz konta?{' '}
          <Link href="/register" className="underline underline-offset-4">
            Zarejestruj się
          </Link>
        </p>
      </section>
    </main>
  );
}
