'use client';

function PageBackground() {
  return (
    <div
      className="wi-page-bg pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden>
      <div className="wi-page-bg__base absolute inset-0" />
      <div className="wi-page-bg__glow absolute inset-[-15%] will-change-transform" />
      <div className="wi-page-bg__grid absolute inset-0 opacity-[0.35]" />
    </div>
  );
}

export { PageBackground };
