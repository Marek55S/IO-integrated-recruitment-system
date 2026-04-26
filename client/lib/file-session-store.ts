/**
 * In-memory store for File objects submitted with a recruitment form.
 *
 * File objects cannot be serialised to JSON / localStorage, so we keep
 * them in a module-level Map that lives for the lifetime of the browser
 * session (until a full page reload). The key is the submission ID — for
 * simplicity we use a single well-known key ("latest") because only one
 * form submission is supported at a time.
 */

const LATEST_KEY = 'latest';

const store = new Map<string, File[]>();

/** Persist the files for the current/latest submission. */
export function saveSubmissionFiles(files: File[]): void {
  store.set(LATEST_KEY, files);
}

/** Retrieve the files saved by the latest submission. Returns [] if none. */
export function getSubmissionFiles(): File[] {
  return store.get(LATEST_KEY) ?? [];
}

/** Clear stored files (e.g., after logout / demo reset). */
export function clearSubmissionFiles(): void {
  store.delete(LATEST_KEY);
}
