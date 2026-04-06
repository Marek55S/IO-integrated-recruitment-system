"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programPageSchema = exports.programsIndexSchema = void 0;
const zod_1 = require("zod");
const form_schema_1 = require("./form-schema");
exports.programsIndexSchema = zod_1.z.object({
    programs: zod_1.z
        .array(zod_1.z.object({
        id: zod_1.z.string().min(1),
        name: zod_1.z.string().min(1),
    }))
        .min(1),
});
exports.programPageSchema = zod_1.z.object({
    program_id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    image_src: zod_1.z.string().min(1),
    form: form_schema_1.formConfigSchema,
});
