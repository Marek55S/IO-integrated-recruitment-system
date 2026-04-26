const LATEST_KEY = 'latest';

const store = new Map<string, File[]>();

export function saveSubmissionFiles(files: File[]): void {
  store.set(LATEST_KEY, files);
}

export function getSubmissionFiles(): File[] {
  return store.get(LATEST_KEY) ?? [];
}

export function clearSubmissionFiles(): void {
  store.delete(LATEST_KEY);
}
