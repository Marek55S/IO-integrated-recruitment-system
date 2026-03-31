import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { formConfigSchema, type FormConfig } from "./form-schema";
import {
  profileViewHeaderSchema,
  recruitmentSectionsFileSchema,
  submissionConfigSchema,
  submissionPayloadSchema,
  type ProfileViewConfig,
  type SubmissionConfig,
} from "./submission-schema";
import {
  programPageSchema,
  programsIndexSchema,
  type ProgramPage,
  type ProgramsIndex,
} from "./programs-schema";

const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Ścieżki do plików YAML. Każda lista zawiera kandydatów — pierwszy
// istniejący plik wygrywa. Wynik jest cachowany na czas procesu (build-time).
// ---------------------------------------------------------------------------

function contentCandidates(filename: string): string[] {
  return [
    path.resolve(process.cwd(), `../content-api/content/${filename}`),
    path.resolve(__dirname, `../content/${filename}`),
  ];
}

const PROGRAMS_DIR_CANDIDATES = [
  path.resolve(process.cwd(), "../content-api/content/programs"),
  path.resolve(__dirname, "../content/programs"),
];

// ---------------------------------------------------------------------------
// Resolver z cache — rozwiązuje ścieżkę raz i zapamiętuje wynik.
// ---------------------------------------------------------------------------

const resolvedPathCache = new Map<string, string>();

function resolvePath(label: string, candidates: string[]): string {
  const cached = resolvedPathCache.get(label);
  if (cached) {
    return cached;
  }

  const filePath = candidates.find((candidatePath) =>
    fs.existsSync(candidatePath),
  );

  if (!filePath) {
    throw new Error(
      `[content-service] Nie znaleziono pliku "${label}". Sprawdzone ścieżki:\n${candidates.map((c) => `  - ${c}`).join("\n")}`,
    );
  }

  resolvedPathCache.set(label, filePath);
  return filePath;
}

function resolveDir(label: string, candidates: string[]): string {
  const cached = resolvedPathCache.get(label);
  if (cached) {
    return cached;
  }

  const dirPath = candidates.find((candidatePath) =>
    fs.existsSync(candidatePath),
  );

  if (!dirPath) {
    throw new Error(
      `[content-service] Nie znaleziono katalogu "${label}". Sprawdzone ścieżki:\n${candidates.map((c) => `  - ${c}`).join("\n")}`,
    );
  }

  resolvedPathCache.set(label, dirPath);
  return dirPath;
}

// ---------------------------------------------------------------------------
// Pomocnicze ładowanie YAML
// ---------------------------------------------------------------------------

function loadYaml(filePath: string): unknown {
  const yamlText = fs.readFileSync(filePath, "utf8");
  return yaml.load(yamlText);
}

function loadRecruitmentSections(): SubmissionConfig["sections"] {
  const filePath = resolvePath(
    "recruitment-data-sections.yaml",
    contentCandidates("recruitment-data-sections.yaml"),
  );
  return recruitmentSectionsFileSchema.parse(loadYaml(filePath)).sections;
}

// ---------------------------------------------------------------------------
// Eksporty typów
// ---------------------------------------------------------------------------

export type { FormConfig } from "./form-schema";
export type {
  ProfileViewConfig,
  SubmissionConfig,
  SubmissionDisplayConfig,
} from "./submission-schema";
export type { ProgramPage, ProgramsIndex } from "./programs-schema";

// ---------------------------------------------------------------------------
// Publiczne gettery — wywoływane w build-time przez Server Components
// ---------------------------------------------------------------------------

export function getFormConfig(): FormConfig {
  const filePath = resolvePath(
    "recruitment-form.yaml",
    contentCandidates("recruitment-form.yaml"),
  );
  return formConfigSchema.parse(loadYaml(filePath));
}

export function getSubmissionConfig(): SubmissionConfig {
  const filePath = resolvePath(
    "recruitment-submission.yaml",
    contentCandidates("recruitment-submission.yaml"),
  );
  const payload = submissionPayloadSchema.parse(loadYaml(filePath));
  const sections = loadRecruitmentSections();

  return submissionConfigSchema.parse({ ...payload, sections });
}

export function getProfileViewConfig(): ProfileViewConfig {
  const filePath = resolvePath(
    "profile-view.yaml",
    contentCandidates("profile-view.yaml"),
  );
  const header = profileViewHeaderSchema.parse(loadYaml(filePath));
  const sections = loadRecruitmentSections();

  return { ...header, sections };
}

export function getProgramsIndex(): ProgramsIndex {
  const programsDir = resolveDir("programs", PROGRAMS_DIR_CANDIDATES);
  const indexPath = path.join(programsDir, "index.yaml");

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `[content-service] Plik programs/index.yaml nie istnieje w: ${indexPath}`,
    );
  }

  return programsIndexSchema.parse(loadYaml(indexPath));
}

export function getProgramPageById(programId: string): ProgramPage | null {
  if (!PROGRAM_ID_PATTERN.test(programId)) {
    return null;
  }

  const programsDir = resolveDir("programs", PROGRAMS_DIR_CANDIDATES);
  const filePath = path.join(programsDir, `${programId}.yaml`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const page = programPageSchema.parse(loadYaml(filePath));

  if (page.program_id !== programId) {
    return null;
  }

  return page;
}
