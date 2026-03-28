import { z } from "zod";

import { formConfigSchema } from "./form-schema";

export const programsIndexSchema = z.object({
  programs: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .min(1),
});

export const programPageSchema = z.object({
  program_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  image_src: z.string().min(1),
  form: formConfigSchema,
});

export type ProgramsIndex = z.infer<typeof programsIndexSchema>;
export type ProgramPage = z.infer<typeof programPageSchema>;
