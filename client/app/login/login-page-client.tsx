'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';

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

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Uzupelnij e-mail i haslo.');
      return;
    }

    setError(null);

    const hasCompletedForm = !!localStorage.getItem(
      RECRUITMENT_FORM_VALUES_STORAGE_KEY,
    );

    if (hasCompletedForm && validProgramId) {
      router.push(`/programs/${validProgramId}`);
    } else if (hasCompletedForm) {
      router.push('/');
    } else if (validProgramId) {
      router.push(`/form?programId=${validProgramId}`);
    } else {
      router.push('/form');
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-10">
      <section className="border-primary/15 w-full max-w-md rounded-xl border bg-card p-6 shadow-md md:p-8">
        <h1 className="text-primary text-2xl font-semibold tracking-tight">
          Logowanie
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
            <Label htmlFor="login-password">Haslo</Label>
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
            Zarejestruj sie
          </Link>
        </p>
      </section>

      <Link
        href="/admin"
        className="fixed bottom-4 left-4 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground/50 transition-colors hover:bg-muted/60 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        Panel administratora
      </Link>
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
