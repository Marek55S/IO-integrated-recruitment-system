import { readStudyApplications } from '@/lib/study-applications-storage';

export function canApplyToProgram(programId: string): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  const applications = readStudyApplications();
  return !applications.some((app) => app.programId === programId);
}

export function getApplicationForProgram(programId: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const applications = readStudyApplications();
  return applications.find((app) => app.programId === programId) ?? null;
}
