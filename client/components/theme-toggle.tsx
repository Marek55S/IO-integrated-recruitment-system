'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export function ThemeToggle() {
  // Start as dark (matches SSR default)
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Read actual state after hydration
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'}
      title={isDark ? 'Tryb jasny' : 'Tryb ciemny'}
      className={buttonVariants({
        variant: 'ghost',
        size: 'icon',
        className: 'text-white hover:bg-white/10 hover:text-white transition-all duration-200',
      })}
    >
      {isDark ? (
        <Sun className="size-5 text-yellow-300" />
      ) : (
        <Moon className="size-5 text-blue-200" />
      )}
    </button>
  );
}
