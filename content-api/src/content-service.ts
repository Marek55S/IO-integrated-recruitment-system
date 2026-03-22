import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { formConfigSchema, type FormConfig } from "./form-schema";

const CONTENT_CANDIDATE_PATHS = [
  path.resolve(process.cwd(), "../content-api/content/recruitment-form.yaml"),
  path.resolve(process.cwd(), "../content-api/content/base-data-form.pl.yaml"),
  path.resolve(__dirname, "../content/recruitment-form.yaml"),
  path.resolve(__dirname, "../content/base-data-form.pl.yaml"),
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

export type { FormConfig } from "./form-schema";

export function getFormConfig(): FormConfig {
  const filePath = resolveContentPath();
  const yamlText = fs.readFileSync(filePath, "utf8");
  const parsedYaml = yaml.load(yamlText);

  return formConfigSchema.parse(parsedYaml);
}
