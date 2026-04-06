"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submissionConfigSchema = exports.profileViewHeaderSchema = exports.recruitmentSectionsFileSchema = exports.submissionPayloadSchema = exports.submissionSectionSchema = void 0;
exports.buildSubmissionAgreementSchema = buildSubmissionAgreementSchema;
const zod_1 = require("zod");
const submissionItemSchema = zod_1.z.object({
    field_id: zod_1.z.string().min(1),
    label: zod_1.z.string().min(1),
});
exports.submissionSectionSchema = zod_1.z.object({
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
    sections: zod_1.z.array(exports.submissionSectionSchema).min(1),
    agreements: zod_1.z.array(submissionAgreementSchema).min(1),
    /** Summary screen primary button — client action id. */
    submit_action: zod_1.z.string().min(1).optional(),
    /** Back from summary to last form step — client action id. */
    back_action: zod_1.z.string().min(1).optional(),
});
exports.submissionConfigSchema = submissionConfigSchema;
/** Plik recruitment-submission.yaml bez sekcji (sekcje z recruitment-data-sections.yaml). */
exports.submissionPayloadSchema = submissionConfigSchema.omit({
    sections: true,
});
/** Plik recruitment-data-sections.yaml */
exports.recruitmentSectionsFileSchema = zod_1.z.object({
    sections: zod_1.z.array(exports.submissionSectionSchema).min(1),
});
exports.profileViewHeaderSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
});
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
