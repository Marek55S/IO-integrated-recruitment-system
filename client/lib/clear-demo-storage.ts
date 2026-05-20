import { clearFormDraft } from '@/lib/recruitment-storage';
import {
  STUDY_APPLICATIONS_CHANGED_EVENT,
  STUDY_APPLICATIONS_STORAGE_KEY,
} from '@/lib/study-applications-storage';

export function clearAllDemoRecruitmentStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STUDY_APPLICATIONS_STORAGE_KEY);
    clearFormDraft();
  } catch {}

  window.dispatchEvent(new Event(STUDY_APPLICATIONS_CHANGED_EVENT));
}
