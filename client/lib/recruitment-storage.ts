export const RECRUITMENT_FORM_VALUES_STORAGE_KEY = 'io-recruitment-form-values';
export const RECRUITMENT_FORM_STEP_STORAGE_KEY = 'io-recruitment-form-step';

type FormDraft = {
  values: Record<string, unknown>;
  stepIndex: number;
};

export function saveFormDraft(values: Record<string, unknown>, stepIndex: number): void {
  try {
    const serialisable = Object.fromEntries(
      Object.entries(values).filter(
        ([, v]) => !Array.isArray(v) && !(v instanceof File),
      ),
    );
    localStorage.setItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY, JSON.stringify(serialisable));
    localStorage.setItem(RECRUITMENT_FORM_STEP_STORAGE_KEY, String(stepIndex));
  } catch {
    // localStorage may be unavailable (SSR, quota exceeded, etc.)
  }
}

export function loadFormDraft(): FormDraft | null {
  try {
    const raw = localStorage.getItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY);
    if (!raw) return null;
    const values = JSON.parse(raw) as Record<string, unknown>;
    const step = parseInt(localStorage.getItem(RECRUITMENT_FORM_STEP_STORAGE_KEY) ?? '0', 10);
    return { values, stepIndex: Number.isFinite(step) ? step : 0 };
  } catch {
    return null;
  }
}

export function clearFormDraft(): void {
  try {
    localStorage.removeItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY);
    localStorage.removeItem(RECRUITMENT_FORM_STEP_STORAGE_KEY);
  } catch {}
}
