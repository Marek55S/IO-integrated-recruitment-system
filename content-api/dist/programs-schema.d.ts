import { z } from "zod";
export declare const programsIndexSchema: z.ZodObject<{
    programs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const programPageSchema: z.ZodObject<{
    program_id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    image_src: z.ZodString;
    form: z.ZodObject<{
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
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ProgramsIndex = z.infer<typeof programsIndexSchema>;
export type ProgramPage = z.infer<typeof programPageSchema>;
