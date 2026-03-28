'use client';

/**
 * Delikatne, ruchome tło w tonacji znaku AGH (zieleń, granat, czerń).
 * Warstwa statyczna + rozmyte „bloby” z osobnymi animacjami.
 */
function PageBackground() {
  return (
    <div
      className="agh-page-bg pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden>
      <div className="agh-page-bg__base absolute inset-0" />
      <div className="agh-page-bg__blob agh-page-bg__blob--1 absolute rounded-full will-change-transform" />
      <div className="agh-page-bg__blob agh-page-bg__blob--2 absolute rounded-full will-change-transform" />
      <div className="agh-page-bg__blob agh-page-bg__blob--3 absolute rounded-full will-change-transform" />
      <div className="agh-page-bg__blob agh-page-bg__blob--4 absolute rounded-full will-change-transform" />
    </div>
  );
}

export { PageBackground };
