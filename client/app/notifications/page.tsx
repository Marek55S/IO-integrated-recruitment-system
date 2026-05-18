'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Notification = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  sent_at: string;
  type: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TYPE_LABELS: Record<string, string> = {
  status_change: 'Status wniosku',
  payment_reminder: 'Płatność',
  documents_incomplete: 'Dokumenty',
  welcome: 'Witamy',
  accepted: 'Przyjęcie',
  studies_not_launched: 'Informacja',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) setNotifications(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => markRead(n.id)));
  };

  const displayed = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Bell className="size-8 text-blue-400" />
              Powiadomienia
            </h1>
            <p className="text-white/50 mt-1 text-sm">
              {unreadCount > 0
                ? `Masz ${unreadCount} nieprzeczytanych wiadomości`
                : 'Wszystkie wiadomości przeczytane'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllRead}
              className="shrink-0 border-white/20 text-white hover:bg-white/10 bg-transparent">
              <CheckCheck className="size-4 mr-1.5" />
              Oznacz wszystkie
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-0">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                filter === f
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              {f === 'all' ? 'Wszystkie' : 'Nieprzeczytane'}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <Bell className="size-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">
              {filter === 'unread' ? 'Brak nieprzeczytanych powiadomień' : 'Brak powiadomień'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayed.map((n) => (
              <li
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`group rounded-xl border p-4 transition-all cursor-pointer ${
                  n.is_read
                    ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    : 'border-blue-500/30 bg-blue-500/[0.07] hover:bg-blue-500/[0.12]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.is_read && (
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400 ring-2 ring-blue-400/20" />
                  )}
                  <div className={`flex-1 min-w-0 ${n.is_read ? '' : ''}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60 uppercase tracking-wide">
                          {TYPE_LABELS[n.type] ?? n.type}
                        </span>
                        {!n.is_read && (
                          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
                            Nowe
                          </span>
                        )}
                      </div>
                      <time className="text-[11px] text-white/30">{formatDate(n.sent_at)}</time>
                    </div>
                    <h3 className="mt-1.5 text-sm font-semibold text-white">{n.title}</h3>
                    <p className="mt-0.5 text-sm text-white/60 leading-relaxed">{n.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
