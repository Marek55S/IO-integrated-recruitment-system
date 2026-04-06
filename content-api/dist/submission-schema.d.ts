import { z } from "zod";
export declare const submissionSectionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        field_id: z.ZodString;
        label: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
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
    submit_action: z.ZodOptional<z.ZodString>;
    back_action: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Plik recruitment-submission.yaml bez sekcji (sekcje z recruitment-data-sections.yaml). */
export declare const submissionPayloadSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
    back_action: z.ZodOptional<z.ZodString>;
    version: z.ZodString;
    submission_id: z.ZodString;
    agreements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        required: z.ZodBoolean;
        link: z.ZodOptional<z.ZodString>;
        link_text: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    submit_action: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/** Plik recruitment-data-sections.yaml */
export declare const recruitmentSectionsFileSchema: z.ZodObject<{
    sections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            field_id: z.ZodString;
            label: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const profileViewHeaderSchema: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SubmissionConfig = z.infer<typeof submissionConfigSchema>;
export type SubmissionAgreement = SubmissionConfig["agreements"][number];
export type SubmissionDisplayConfig = Pick<SubmissionConfig, "title" | "subtitle" | "sections">;
export type ProfileViewHeader = z.infer<typeof profileViewHeaderSchema>;
export type ProfileViewConfig = ProfileViewHeader & {
    sections: SubmissionConfig["sections"];
};
export { submissionConfigSchema };
export declare function buildSubmissionAgreementSchema(config: SubmissionConfig): z.ZodObject<{
    [x: string]: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
