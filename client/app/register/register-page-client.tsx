'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';

type RegisterPageClientProps = {
  validProgramIds: string[];
};

function RegisterForm({ validProgramIds }: RegisterPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId');

  const validProgramId =
    programId && validProgramIds.includes(programId) ? programId : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!email || !password || !repeatPassword) {
      setError('Uzupełnij wszystkie pola.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Hasła muszą być takie same.');
      return;
    }

    if (!privacyAccepted) {
      setError('Zaakceptuj politykę prywatności.');
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
    <main className="flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-10">
      <section className="border-primary/15 w-full max-w-md rounded-xl border bg-card p-6 shadow-md md:p-8">
        <h1 className="text-primary text-2xl font-semibold tracking-tight">
          Rejestracja
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-email">E-mail</Label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="twoj@email.pl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Hasło</Label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-repeat-password">Powtórz hasło</Label>
            <Input
              id="register-repeat-password"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.currentTarget.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="register-privacy"
              checked={privacyAccepted}
              onChange={(event) =>
                setPrivacyAccepted(event.currentTarget.checked)
              }
            />
            <Label htmlFor="register-privacy" className="leading-5">
              Akceptuję politykę prywatności{' '}
              <a
                href="https://uczelnia.pl/polityka-prywatnosci"
                target="_blank"
                rel="noreferrer"
                className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline">
                (szczegóły)
              </a>
            </Label>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" variant="default" className="w-full">
            Zarejestruj
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Masz konto?{' '}
          <Link
            href={
              validProgramId ? `/login?programId=${validProgramId}` : '/login'
            }
            className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </section>
    </main>
  );
}

export function RegisterPageClient(props: RegisterPageClientProps) {
  return (
    <Suspense fallback={null}>
      <RegisterForm {...props} />
    </Suspense>
  );
}
