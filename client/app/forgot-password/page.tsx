'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowLeft, Copy, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'token' | 'reset' | 'done'>('request');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRequestToken = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Podaj adres e-mail'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // Dev: extract token from message
      const match = data.message?.match(/Token resetowania: ([A-Za-z0-9_-]+)/);
      if (match) setDevToken(match[1]);
      setStep('token');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!token.trim()) { setError('Wklej token resetowania'); return; }
    if (newPassword.length < 8) { setError('Hasło musi mieć co najmniej 8 znaków'); return; }
    if (newPassword !== confirmPassword) { setError('Hasła nie są zgodne'); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || data.error || 'Błąd resetu'); return; }
      setStep('done');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (devToken) {
      navigator.clipboard.writeText(devToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-10">
      <section className="border-primary/15 w-full max-w-md rounded-xl border bg-card p-6 shadow-md md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Resetowanie hasła</h1>
            <p className="text-xs text-muted-foreground">
              {step === 'request' && 'Podaj e-mail, wyślemy token resetowania'}
              {step === 'token' && 'Sprawdź wiadomość i wklej token'}
              {step === 'done' && 'Hasło zostało zmienione'}
            </p>
          </div>
        </div>

        {step === 'request' && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Adres e-mail</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Wysyłanie…' : 'Wyślij token resetowania'}
            </Button>
            <Link href="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-3.5" /> Wróć do logowania
            </Link>
          </form>
        )}

        {step === 'token' && (
          <form onSubmit={handleReset} className="space-y-4">
            {/* Dev helper */}
            {devToken && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  🔧 Tryb deweloperski — token resetowania:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded bg-black/10 px-2 py-1 text-xs font-mono text-amber-700 dark:text-amber-300">
                    {devToken}
                  </code>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="shrink-0 text-amber-600 hover:text-amber-500"
                    aria-label="Kopiuj token"
                  >
                    {copied ? <CheckCheck className="size-4" /> : <Copy className="size-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">
                  W produkcji token byłby wysłany na e-mail. Wklej go poniżej.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reset-token">Token resetowania</Label>
              <Input
                id="reset-token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Wklej token z wiadomości"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 znaków"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Powtórz hasło</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Powtórz nowe hasło"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Zapisywanie…' : 'Ustaw nowe hasło'}
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <CheckCheck className="size-7 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Hasło zostało zmienione. Możesz się teraz zalogować.
            </p>
            <Link href="/login">
              <Button className="w-full">Przejdź do logowania</Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
