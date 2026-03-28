'use client';

type BrandedPageLoaderProps = {
  label?: string;
  /** Pełny ekran z lekkim przyciemnieniem (np. pierwsze ładowanie). */
  fullScreen?: boolean;
};

/**
 * Spinner z płynną zmianą koloru obrysu (zieleń → czerń → czerwień AGH) podczas obrotu.
 */
function BrandedPageLoader({
  label = 'Ładowanie…',
  fullScreen = false,
}: BrandedPageLoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5 py-12">
      <div className="branded-loader" aria-hidden>
        <svg
          className="branded-loader__svg"
          viewBox="0 0 50 50"
          width={56}
          height={56}
          role="img">
          <circle
            className="branded-loader__track"
            cx="25"
            cy="25"
            r="21"
            fill="none"
            strokeWidth="3.5"
          />
          <circle
            className="branded-loader__arc"
            cx="25"
            cy="25"
            r="21"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {label ? (
        <p className="text-muted-foreground text-sm font-medium tracking-wide">
          {label}
        </p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f2f6f3]/75 backdrop-blur-[2px] dark:bg-[#141a17]/80">
        {content}
      </div>
    );
  }

  return <div className="w-full">{content}</div>;
}

export { BrandedPageLoader };
