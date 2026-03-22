"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionConfigSchema = void 0;
exports.buildSubmissionAgreementSchema = buildSubmissionAgreementSchema;
const zod_1 = require("zod");
const submissionItemSchema = zod_1.z.object({
    field_id: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
});
const submissionSectionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    items: zod_1.z.array(submissionItemSchema).min(1),
});
const submissionAgreementSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
    required: zod_1.z.boolean(),
    link: zod_1.z.string().url().optional(),
    link_text: zod_1.z.string().optional(),
});
const submissionConfigSchema = zod_1.z.object({
    submission_id: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    sections: zod_1.z.array(submissionSectionSchema).min(1),
    agreements: zod_1.z.array(submissionAgreementSchema).min(1),
});
exports.submissionConfigSchema = submissionConfigSchema;
function buildSubmissionAgreementSchema(config) {
    const shape = {};
    for (const agreement of config.agreements) {
        shape[agreement.id] = agreement.required
            ? zod_1.z.literal(true, {
                message: `${agreement.label} jest wymagane.`,
            })
            : zod_1.z.boolean().optional();
    }
    return zod_1.z.object(shape);
}
