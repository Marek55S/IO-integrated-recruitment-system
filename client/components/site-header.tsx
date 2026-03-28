'use client';

import Link from 'next/link';

function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-4">
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
      </div>
    </header>
  );
}

export { SiteHeader };
