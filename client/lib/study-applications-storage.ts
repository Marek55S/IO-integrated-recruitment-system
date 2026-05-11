export type StudyApplicationStatus = 'awaiting_payment' | 'paid' | 'cancelled';

export type StudyApplication = {
  id: string;
  programId: string;
  programName: string;
  submittedAt: string;
  status: StudyApplicationStatus;
};

export const STUDY_APPLICATIONS_STORAGE_KEY = 'io-study-applications';

export const STUDY_APPLICATIONS_CHANGED_EVENT = 'io-study-applications-changed';

const VALID_STATUSES: ReadonlySet<string> = new Set([
  'awaiting_payment',
  'paid',
  'cancelled',
]);

export function readStudyApplications(): StudyApplication[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STUDY_APPLICATIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is StudyApplication => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const record = item as Record<string, unknown>;

      return (
        typeof record.id === 'string' &&
        typeof record.programId === 'string' &&
        typeof record.programName === 'string' &&
        typeof record.submittedAt === 'string' &&
        typeof record.status === 'string' &&
        VALID_STATUSES.has(record.status)
      );
    });
  } catch {
    return [];
  }
}

function writeStudyApplications(applications: StudyApplication[]) {
  localStorage.setItem(
    STUDY_APPLICATIONS_STORAGE_KEY,
    JSON.stringify(applications),
  );
  window.dispatchEvent(new Event(STUDY_APPLICATIONS_CHANGED_EVENT));
}

export function appendStudyApplication(
  entry: Omit<StudyApplication, 'id' | 'status'> & {
    status?: StudyApplicationStatus;
  },
): StudyApplication {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `app-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const next: StudyApplication = {
    id,
    programId: entry.programId,
    programName: entry.programName,
    submittedAt: entry.submittedAt,
    status: entry.status ?? 'awaiting_payment',
  };

  const list = readStudyApplications();
  writeStudyApplications([next, ...list]);
  return next;
}

export function setStudyApplicationStatus(
  id: string,
  status: StudyApplicationStatus,
) {
  const list = readStudyApplications();
  const next = list.map((app) => (app.id === id ? { ...app, status } : app));
  writeStudyApplications(next);
}

export function cancelStudyApplication(id: string) {
  setStudyApplicationStatus(id, 'cancelled');
}

export function studyApplicationStatusLabel(
  status: StudyApplicationStatus,
): string {
  switch (status) {
    case 'paid':
      return 'Zapłacone';
    case 'cancelled':
      return 'Anulowany';
    default:
      return 'Oczekiwanie na płatność';
  }
}
