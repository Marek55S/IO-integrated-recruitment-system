import { z } from "zod";
declare const formConfigSchema: z.ZodObject<{
    form_id: z.ZodString;
    version: z.ZodString;
    screens: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        title: z.ZodString;
        subtitle: z.ZodOptional<z.ZodString>;
        fields: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            placeholder: z.ZodOptional<z.ZodString>;
            input_info: z.ZodOptional<z.ZodString>;
            regex: z.ZodOptional<z.ZodString>;
            link: z.ZodOptional<z.ZodString>;
            link_text: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"select">;
            options: z.ZodArray<z.ZodString>;
            required: z.ZodBoolean;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
            input_info: z.ZodOptional<z.ZodString>;
            regex: z.ZodOptional<z.ZodString>;
            link: z.ZodOptional<z.ZodString>;
            link_text: z.ZodOptional<z.ZodString>;
            type: z.ZodLiteral<"section_title">;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            required: z.ZodOptional<z.ZodBoolean>;
            placeholder: z.ZodOptional<z.ZodString>;
            input_info: z.ZodOptional<z.ZodString>;
            regex: z.ZodOptional<z.ZodString>;
            link: z.ZodOptional<z.ZodString>;
            link_text: z.ZodOptional<z.ZodString>;
            type: z.ZodEnum<{
                number: "number";
                text: "text";
                email: "email";
                tel: "tel";
                checkbox: "checkbox";
                date: "date";
            }>;
        }, z.core.$strip>], "type">>;
        button_text: z.ZodString;
        primary_action: z.ZodOptional<z.ZodString>;
        back_action: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type FormConfig = z.infer<typeof formConfigSchema>;
export type FormScreen = FormConfig["screens"][number];
export type FormField = FormScreen["fields"][number];
export { formConfigSchema };
export declare function buildFormDataSchema(config: FormConfig): z.ZodObject<{
    [x: string]: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
}, z.core.$strip>;
