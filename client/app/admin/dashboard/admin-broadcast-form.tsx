'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminBroadcastForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sentTo, setSentTo] = useState(0);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSentTo(data.sent_to ?? 0);
      setStatus('success');
      setTitle('');
      setBody('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/10 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
        <Send className="size-5" />
        Wyślij powiadomienie do wszystkich kandydatów
      </h2>

      <div className="space-y-3">
        <div>
          <label htmlFor="broadcast-title" className="block text-sm font-medium text-foreground mb-1">
            Tytuł wiadomości *
          </label>
          <input
            id="broadcast-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Ważna informacja dotycząca rekrutacji"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        <div>
          <label htmlFor="broadcast-body" className="block text-sm font-medium text-foreground mb-1">
            Treść wiadomości *
          </label>
          <textarea
            id="broadcast-body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Wpisz treść powiadomienia..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleSend}
            disabled={status === 'sending' || !title.trim() || !body.trim()}
            className="bg-amber-600 hover:bg-amber-500 text-white"
          >
            {status === 'sending' ? 'Wysyłanie…' : 'Wyślij do wszystkich'}
          </Button>

          {status === 'success' && (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Wysłano do {sentTo} kandydatów
            </span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              ✗ Błąd wysyłania — spróbuj ponownie
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
