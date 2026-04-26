import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';
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
    localStorage.removeItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY);
  } catch {}

  window.dispatchEvent(new Event(STUDY_APPLICATIONS_CHANGED_EVENT));
}
