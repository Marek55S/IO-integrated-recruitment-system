'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Po zmianie trasy (Next) płynnie przewija widok na górę strony.
 */
function ScrollToTopOnRoute() {
  const pathname = usePathname();
  const isFirstPaint = useRef(true);

  useEffect(() => {
    if (isFirstPaint.current) {
      isFirstPaint.current = false;
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

export { ScrollToTopOnRoute };
