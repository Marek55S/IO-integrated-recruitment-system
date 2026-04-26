/**
 * mockedBackend/applications.ts
 *
 * Symuluje logikę backendową dotyczącą wniosków rekrutacyjnych.
 */

import {
  readStudyApplications,
} from '@/lib/study-applications-storage';

/**
 * Sprawdza, czy kandydat może złożyć wniosek na dany kierunek.
 * Zwraca false jeśli istnieje już wniosek (niezależnie od statusu —
 * również anulowane blokują ponowne złożenie).
 */
export function canApplyToProgram(programId: string): boolean {
  if (typeof window === 'undefined') {
    // SSR — domyślnie zezwalamy, faktyczne sprawdzenie po stronie klienta
    return true;
  }

  const applications = readStudyApplications();
  return !applications.some((app) => app.programId === programId);
}

/**
 * Zwraca istniejący wniosek dla danego kierunku lub null.
 */
export function getApplicationForProgram(programId: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const applications = readStudyApplications();
  return applications.find((app) => app.programId === programId) ?? null;
}
