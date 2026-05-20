'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, BookOpen, ClipboardList, UserRound, X } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  sent_at: string;
  type: string;
};

const LOGO_PATHS_WITHOUT_HOME_LINK = new Set([
  '/login',
  '/register',
  '/form',
  '/admin',
]);

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) setNotifications(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const preview = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}`}
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon',
          className: 'relative text-white hover:bg-white/10 hover:text-white',
        })}
      >
        <Bell className="size-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-[#0d1829] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Powiadomienia</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors"
              aria-label="Zamknij">
              <X className="size-4" />
            </button>
          </div>

          {/* List */}
          {preview.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/40">
              Brak powiadomień
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {preview.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                    !n.is_read ? 'bg-white/[0.03]' : ''
                  }`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                    )}
                    <div className={!n.is_read ? '' : 'pl-4'}>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-white/30 mt-1">{formatDate(n.sent_at)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-blue-400 hover:text-blue-300 py-1 transition-colors"
            >
              Zobacz wszystkie powiadomienia
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isAdminArea = pathname.startsWith('/admin') && pathname !== '/admin';
  const logoHref = isAdminArea ? '/admin/dashboard' : '/';

  // Show nav icons on any non-auth page that isn't admin
  const showNavIcons =
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/register') &&
    !pathname.startsWith('/admin');

  const logoImg = (
    <img
      src="/programs/WI.svg"
      alt=""
      width={190}
      height={190}
      className="h-[3.5rem] w-auto max-h-[calc(4.25rem-0.5rem)] max-w-[min(100%,240px)] object-contain object-center"
      draggable={false}
    />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220] shadow-md">
      <div className="relative mx-auto flex h-[4.25rem] max-w-6xl items-center justify-center px-4">
        <Link
          href={logoHref}
          className="flex items-center transition-opacity hover:opacity-90"
          aria-label="Strona główna">
          {logoImg}
        </Link>

        {/* ThemeToggle widoczny w obszarze admina */}
        {isAdminArea && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <ThemeToggle />
          </div>
        )}

        {showNavIcons && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 flex items-center gap-1">
            {/* Przełącznik motywu — kandydaci */}
            <ThemeToggle />

            {/* Materiały */}
            <Link
              href="/materials"
              aria-label="Materiały i zasoby"
              title="Materiały i zasoby"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'text-white hover:bg-white/10 hover:text-white',
              })}
            >
              <BookOpen className="size-6" />
            </Link>

            {/* Ankieta satysfakcji */}
            <Link
              href="/survey"
              aria-label="Ankieta satysfakcji"
              title="Wypełnij ankietę"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'text-white hover:bg-white/10 hover:text-white',
              })}
            >
              <ClipboardList className="size-6" />
            </Link>

            {/* Powiadomienia */}
            <NotificationBell />

            {/* Profil */}
            <Link
              href="/profile"
              aria-label="Profil"
              title="Mój profil"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'text-white hover:bg-white/10 hover:text-white',
              })}
            >
              <UserRound className="size-6" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

export { SiteHeader };
