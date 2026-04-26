import { z } from "zod";

const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "number",
  "checkbox",
  "date",
  "select",
  "section_title",
  "file_upload",
] as const;

const baseFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(FIELD_TYPES),
  label: z.string().min(1),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  input_info: z.string().optional(),
  regex: z.string().optional(),
  link: z.string().url().optional(),
  link_text: z.string().optional(),
});

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(z.string().min(1)).min(1),
  required: z.boolean(),
});

const sectionTitleFieldSchema = baseFieldSchema.extend({
  type: z.literal("section_title"),
});

const fileUploadFieldSchema = baseFieldSchema.extend({
  type: z.literal("file_upload"),
  /** Tekst opisu wyświetlany nad polem uploadu. */
  description_text: z.string().optional(),
  /** Maksymalna liczba plików (domyślnie 5). */
  max_files: z.number().int().positive().optional(),
  /** Maksymalny rozmiar pojedynczego pliku w MB (domyślnie 5). */
  max_size_mb: z.number().positive().optional(),
});

const standardInputFieldSchema = baseFieldSchema.extend({
  type: z.enum(["text", "email", "tel", "number", "checkbox", "date"]),
});

const fieldSchema = z.discriminatedUnion("type", [
  selectFieldSchema,
  sectionTitleFieldSchema,
  fileUploadFieldSchema,
  standardInputFieldSchema,
]);

const screenSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  fields: z.array(fieldSchema).min(1),
  button_text: z.string().min(1),
  /** Client action id — registry: `client/lib/content-form-actions.ts`. */
  primary_action: z.string().min(1).optional(),
  back_action: z.string().min(1).optional(),
});

const formConfigSchema = z.object({
  form_id: z.string().min(1),
  version: z.string().min(1),
  screens: z.array(screenSchema).min(1),
});

export type FormConfig = z.infer<typeof formConfigSchema>;
export type FormScreen = FormConfig["screens"][number];
export type FormField = FormScreen["fields"][number];

export { formConfigSchema };

function safeRegExp(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    console.error(
      `[form-schema] Niepoprawne wyrażenie regularne: "${pattern}" — pole zostanie walidowane bez wzorca.`,
    );
    return null;
  }
}

export function buildFormDataSchema(config: FormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const screen of config.screens) {
    for (const field of screen.fields) {
      if (field.type === "section_title") {
        continue;
      }

      // Pliki są przechowywane jako File[] w stanie RHF — walidacja po stronie komponentu.
      if (field.type === "file_upload") {
        shape[field.id] = z.any().optional();
        continue;
      }

      if (field.type === "checkbox") {
        shape[field.id] = field.required
          ? z.literal(true, {
              message: `${field.label} jest wymagane.`,
            })
          : z.boolean().optional();
        continue;
      }

      if (field.type === "select") {
        const selectSchema = z
          .string()
          .refine(
            (value) => field.options.includes(value),
            `${field.label} ma niepoprawna wartosc.`,
          );

        shape[field.id] = field.required
          ? selectSchema.min(1, `${field.label} jest wymagane.`)
          : z
              .string()
              .optional()
              .transform((value) => value ?? "")
              .refine(
                (value) => !value || field.options.includes(value),
                `${field.label} ma niepoprawna wartosc.`,
              );
        continue;
      }

      const regexp = field.regex ? safeRegExp(field.regex) : null;

      shape[field.id] = field.required
        ? z
            .string()
            .min(1, `${field.label} jest wymagane.`)
            .refine(
              (value) => !regexp || regexp.test(value),
              `${field.label} ma niepoprawny format.`,
            )
        : z
            .string()
            .optional()
            .transform((value) => value ?? "")
            .refine(
              (value) => !value || !regexp || regexp.test(value),
              `${field.label} ma niepoprawny format.`,
            );
    }
  }

  return z.object(shape);
}
