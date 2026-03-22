"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formConfigSchema = void 0;
exports.buildFormDataSchema = buildFormDataSchema;
const zod_1 = require("zod");
const FIELD_TYPES = [
    'text',
    'email',
    'tel',
    'number',
    'checkbox',
    'date',
    'select',
    'section_title',
];
const baseFieldSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    type: zod_1.z.enum(FIELD_TYPES),
    label: zod_1.z.string().min(1),
    required: zod_1.z.boolean().optional(),
    placeholder: zod_1.z.string().optional(),
    input_info: zod_1.z.string().optional(),
    regex: zod_1.z.string().optional(),
    link: zod_1.z.string().url().optional(),
});
const selectFieldSchema = baseFieldSchema.extend({
    type: zod_1.z.literal('select'),
    options: zod_1.z.array(zod_1.z.string().min(1)).min(1),
    required: zod_1.z.boolean(),
});
const sectionTitleFieldSchema = baseFieldSchema.extend({
    type: zod_1.z.literal('section_title'),
});
const standardInputFieldSchema = baseFieldSchema.extend({
    type: zod_1.z.enum(['text', 'email', 'tel', 'number', 'checkbox', 'date']),
});
const fieldSchema = zod_1.z.discriminatedUnion('type', [
    selectFieldSchema,
    sectionTitleFieldSchema,
    standardInputFieldSchema,
]);
const screenSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    fields: zod_1.z.array(fieldSchema).min(1),
    button_text: zod_1.z.string().min(1),
});
const formConfigSchema = zod_1.z.object({
    form_id: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    screens: zod_1.z.array(screenSchema).min(1),
});
exports.formConfigSchema = formConfigSchema;
function buildFormDataSchema(config) {
    const shape = {};
    for (const screen of config.screens) {
        for (const field of screen.fields) {
            if (field.type === 'section_title') {
                continue;
            }
            if (field.type === 'checkbox') {
                shape[field.id] = field.required
                    ? zod_1.z.literal(true, {
                        message: `${field.label} jest wymagane.`,
                    })
                    : zod_1.z.boolean().optional();
                continue;
            }
            if (field.type === 'select') {
                const selectSchema = zod_1.z
                    .string()
                    .refine((value) => field.options.includes(value), `${field.label} ma niepoprawna wartosc.`);
                shape[field.id] = field.required
                    ? selectSchema.min(1, `${field.label} jest wymagane.`)
                    : zod_1.z
                        .string()
                        .optional()
                        .transform((value) => value ?? '')
                        .refine((value) => !value || field.options.includes(value), `${field.label} ma niepoprawna wartosc.`);
                continue;
            }
            const regexp = field.regex ? new RegExp(field.regex) : null;
            shape[field.id] = field.required
                ? zod_1.z
                    .string()
                    .min(1, `${field.label} jest wymagane.`)
                    .refine((value) => !regexp || regexp.test(value), `${field.label} ma niepoprawny format.`)
                : zod_1.z
                    .string()
                    .optional()
                    .transform((value) => value ?? '')
                    .refine((value) => !value || !regexp || regexp.test(value), `${field.label} ma niepoprawny format.`);
        }
    }
    return zod_1.z.object(shape);
}
