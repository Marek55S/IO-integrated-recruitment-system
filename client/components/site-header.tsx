'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';

function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="border-b bg-background">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-center px-4">
        <Link
          href="/"
          className="flex items-center"
          aria-label="Strona główna — rekrutacja">
          <img
            src="/uczelnia-logo.svg"
            alt=""
            width={200}
            height={48}
            className="h-10 w-auto max-w-[min(100%,200px)] object-contain object-center"
          />
        </Link>

        {isHome ? (
          <Link
            href="/profile"
            aria-label="Profil"
            className={buttonVariants({
              variant: 'ghost',
              size: 'icon',
              className: 'absolute top-1/2 right-4 -translate-y-1/2',
            })}>
            <UserRound className="size-6" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}

export { SiteHeader };
