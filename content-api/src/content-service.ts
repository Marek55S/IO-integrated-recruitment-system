import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { formConfigSchema, type FormConfig } from "./form-schema";
import {
  submissionConfigSchema,
  type SubmissionConfig,
} from "./submission-schema";
import {
  programPageSchema,
  programsIndexSchema,
  type ProgramPage,
  type ProgramsIndex,
} from "./programs-schema";

const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const PROGRAMS_DIR_CANDIDATES = [
  path.resolve(process.cwd(), "../content-api/content/programs"),
  path.resolve(__dirname, "../content/programs"),
];

const CONTENT_CANDIDATE_PATHS = [
  path.resolve(process.cwd(), "../content-api/content/recruitment-form.yaml"),
  path.resolve(process.cwd(), "../content-api/content/base-data-form.pl.yaml"),
  path.resolve(__dirname, "../content/recruitment-form.yaml"),
  path.resolve(__dirname, "../content/base-data-form.pl.yaml"),
];

const SUBMISSION_CANDIDATE_PATHS = [
  path.resolve(
    process.cwd(),
    "../content-api/content/recruitment-submission.yaml",
  ),
  path.resolve(__dirname, "../content/recruitment-submission.yaml"),
];

function resolveContentPath(): string {
  const filePath = CONTENT_CANDIDATE_PATHS.find((candidatePath) =>
    fs.existsSync(candidatePath),
  );

  if (!filePath) {
    throw new Error(
      `Could not find YAML form config. Tried: ${CONTENT_CANDIDATE_PATHS.join(", ")}`,
    );
  }

  return filePath;
}

function resolveSubmissionPath(): string {
  const filePath = SUBMISSION_CANDIDATE_PATHS.find((candidatePath) =>
    fs.existsSync(candidatePath),
  );

  if (!filePath) {
    throw new Error(
      `Could not find YAML submission config. Tried: ${SUBMISSION_CANDIDATE_PATHS.join(", ")}`,
    );
  }

  return filePath;
}

function resolveProgramsDir(): string {
  const dirPath = PROGRAMS_DIR_CANDIDATES.find((candidatePath) =>
    fs.existsSync(candidatePath),
  );

  if (!dirPath) {
    throw new Error(
      `Could not find programs content directory. Tried: ${PROGRAMS_DIR_CANDIDATES.join(", ")}`,
    );
  }

  return dirPath;
}

export type { FormConfig } from "./form-schema";
export type { SubmissionConfig } from "./submission-schema";
export type { ProgramPage, ProgramsIndex } from "./programs-schema";

export function getFormConfig(): FormConfig {
  const filePath = resolveContentPath();
  const yamlText = fs.readFileSync(filePath, "utf8");
  const parsedYaml = yaml.load(yamlText);

  return formConfigSchema.parse(parsedYaml);
}

export function getSubmissionConfig(): SubmissionConfig {
  const filePath = resolveSubmissionPath();
  const yamlText = fs.readFileSync(filePath, "utf8");
  const parsedYaml = yaml.load(yamlText);

  return submissionConfigSchema.parse(parsedYaml);
}

export function getProgramsIndex(): ProgramsIndex {
  const programsDir = resolveProgramsDir();
  const indexPath = path.join(programsDir, "index.yaml");

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Programs index not found at ${indexPath}`);
  }

  const yamlText = fs.readFileSync(indexPath, "utf8");
  const parsedYaml = yaml.load(yamlText);

  return programsIndexSchema.parse(parsedYaml);
}

export function getProgramPageById(programId: string): ProgramPage | null {
  if (!PROGRAM_ID_PATTERN.test(programId)) {
    return null;
  }

  const programsDir = resolveProgramsDir();
  const filePath = path.join(programsDir, `${programId}.yaml`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const yamlText = fs.readFileSync(filePath, "utf8");
  const parsedYaml = yaml.load(yamlText);
  const page = programPageSchema.parse(parsedYaml);

  if (page.program_id !== programId) {
    return null;
  }

  return page;
}
