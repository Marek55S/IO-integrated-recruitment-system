import { z } from "zod";
declare const submissionConfigSchema: z.ZodObject<{
    submission_id: z.ZodString;
    version: z.ZodString;
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    sections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            field_id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    agreements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        required: z.ZodBoolean;
        link: z.ZodOptional<z.ZodString>;
        link_text: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type SubmissionConfig = z.infer<typeof submissionConfigSchema>;
export type SubmissionAgreement = SubmissionConfig["agreements"][number];
export { submissionConfigSchema };
export declare function buildSubmissionAgreementSchema(config: SubmissionConfig): z.ZodObject<{
    [x: string]: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
