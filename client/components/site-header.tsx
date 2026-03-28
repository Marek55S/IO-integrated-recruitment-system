'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';

const LOGO_PATHS_WITHOUT_HOME_LINK = new Set(['/login', '/register', '/form']);

function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const logoIsInteractive = !LOGO_PATHS_WITHOUT_HOME_LINK.has(pathname);

  const logoImg = (
    <img
      src="/programs/AGH.svg"
      alt=""
      width={190}
      height={190}
      className="h-[3.5rem] w-auto max-h-[calc(4.25rem-0.5rem)] max-w-[min(100%,240px)] object-contain object-center"
      draggable={false}
    />
  );

  return (
    <header className="border-primary/80 sticky top-0 z-40 border-b-2 bg-card/92 shadow-sm backdrop-blur-md backdrop-saturate-150">
      <div className="relative mx-auto flex h-[4.25rem] max-w-6xl items-center justify-center px-4">
        {logoIsInteractive ? (
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-90"
            aria-label="Strona główna — rekrutacja">
            {logoImg}
          </Link>
        ) : (
          <span
            className="flex cursor-default items-center"
            aria-label="AGH">
            {logoImg}
          </span>
        )}

        {isHome ? (
          <Link
            href="/profile"
            aria-label="Profil"
            className={buttonVariants({
              variant: 'ghost',
              size: 'icon',
              className:
                'absolute top-1/2 right-4 -translate-y-1/2 text-[#1e1e1e] hover:bg-black/5 hover:text-[#1e1e1e] dark:text-foreground dark:hover:bg-white/10',
            })}>
            <UserRound className="size-6" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export { SiteHeader };
