import { z } from "zod";

const submissionItemSchema = z.object({
  field_id: z.string().min(1),
  label: z.string().min(1),
});

const submissionSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  items: z.array(submissionItemSchema).min(1),
});

const submissionAgreementSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  required: z.boolean(),
  link: z.string().url().optional(),
  link_text: z.string().optional(),
});

const submissionConfigSchema = z.object({
  submission_id: z.string().min(1),
  version: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  sections: z.array(submissionSectionSchema).min(1),
  agreements: z.array(submissionAgreementSchema).min(1),
});

export type SubmissionConfig = z.infer<typeof submissionConfigSchema>;
export type SubmissionAgreement = SubmissionConfig["agreements"][number];

export { submissionConfigSchema };

export function buildSubmissionAgreementSchema(config: SubmissionConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const agreement of config.agreements) {
    shape[agreement.id] = agreement.required
      ? z.literal(true, {
          message: `${agreement.label} jest wymagane.`,
        })
      : z.boolean().optional();
  }

  return z.object(shape);
}
