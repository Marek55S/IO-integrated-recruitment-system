"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormConfig = getFormConfig;
exports.getSubmissionConfig = getSubmissionConfig;
exports.getProfileViewConfig = getProfileViewConfig;
exports.getProgramsIndex = getProgramsIndex;
exports.getProgramPageById = getProgramPageById;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const form_schema_1 = require("./form-schema");
const submission_schema_1 = require("./submission-schema");
const programs_schema_1 = require("./programs-schema");
const PROGRAM_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROGRAMS_DIR_CANDIDATES = [
    node_path_1.default.resolve(process.cwd(), "../content-api/content/programs"),
    node_path_1.default.resolve(__dirname, "../content/programs"),
];
const CONTENT_CANDIDATE_PATHS = [
    node_path_1.default.resolve(process.cwd(), "../content-api/content/recruitment-form.yaml"),
    node_path_1.default.resolve(process.cwd(), "../content-api/content/base-data-form.pl.yaml"),
    node_path_1.default.resolve(__dirname, "../content/recruitment-form.yaml"),
    node_path_1.default.resolve(__dirname, "../content/base-data-form.pl.yaml"),
];
const SUBMISSION_CANDIDATE_PATHS = [
    node_path_1.default.resolve(process.cwd(), "../content-api/content/recruitment-submission.yaml"),
    node_path_1.default.resolve(__dirname, "../content/recruitment-submission.yaml"),
];
const RECRUITMENT_SECTIONS_CANDIDATE_PATHS = [
    node_path_1.default.resolve(process.cwd(), "../content-api/content/recruitment-data-sections.yaml"),
    node_path_1.default.resolve(__dirname, "../content/recruitment-data-sections.yaml"),
];
const PROFILE_VIEW_CANDIDATE_PATHS = [
    node_path_1.default.resolve(process.cwd(), "../content-api/content/profile-view.yaml"),
    node_path_1.default.resolve(__dirname, "../content/profile-view.yaml"),
];
function resolveContentPath() {
    const filePath = CONTENT_CANDIDATE_PATHS.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!filePath) {
        throw new Error(`Could not find YAML form config. Tried: ${CONTENT_CANDIDATE_PATHS.join(", ")}`);
    }
    return filePath;
}
function resolveSubmissionPath() {
    const filePath = SUBMISSION_CANDIDATE_PATHS.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!filePath) {
        throw new Error(`Could not find YAML submission config. Tried: ${SUBMISSION_CANDIDATE_PATHS.join(", ")}`);
    }
    return filePath;
}
function resolveRecruitmentSectionsPath() {
    const filePath = RECRUITMENT_SECTIONS_CANDIDATE_PATHS.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!filePath) {
        throw new Error(`Could not find recruitment-data-sections.yaml. Tried: ${RECRUITMENT_SECTIONS_CANDIDATE_PATHS.join(", ")}`);
    }
    return filePath;
}
function resolveProfileViewPath() {
    const filePath = PROFILE_VIEW_CANDIDATE_PATHS.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!filePath) {
        throw new Error(`Could not find profile-view.yaml. Tried: ${PROFILE_VIEW_CANDIDATE_PATHS.join(", ")}`);
    }
    return filePath;
}
function loadRecruitmentSections() {
    const filePath = resolveRecruitmentSectionsPath();
    const yamlText = node_fs_1.default.readFileSync(filePath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    return submission_schema_1.recruitmentSectionsFileSchema.parse(parsedYaml).sections;
}
function resolveProgramsDir() {
    const dirPath = PROGRAMS_DIR_CANDIDATES.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!dirPath) {
        throw new Error(`Could not find programs content directory. Tried: ${PROGRAMS_DIR_CANDIDATES.join(", ")}`);
    }
    return dirPath;
}
function getFormConfig() {
    const filePath = resolveContentPath();
    const yamlText = node_fs_1.default.readFileSync(filePath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    return form_schema_1.formConfigSchema.parse(parsedYaml);
}
function getSubmissionConfig() {
    const filePath = resolveSubmissionPath();
    const yamlText = node_fs_1.default.readFileSync(filePath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    const payload = submission_schema_1.submissionPayloadSchema.parse(parsedYaml);
    const sections = loadRecruitmentSections();
    return submission_schema_1.submissionConfigSchema.parse({ ...payload, sections });
}
function getProfileViewConfig() {
    const filePath = resolveProfileViewPath();
    const yamlText = node_fs_1.default.readFileSync(filePath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    const header = submission_schema_1.profileViewHeaderSchema.parse(parsedYaml);
    const sections = loadRecruitmentSections();
    return { ...header, sections };
}
function getProgramsIndex() {
    const programsDir = resolveProgramsDir();
    const indexPath = node_path_1.default.join(programsDir, "index.yaml");
    if (!node_fs_1.default.existsSync(indexPath)) {
        throw new Error(`Programs index not found at ${indexPath}`);
    }
    const yamlText = node_fs_1.default.readFileSync(indexPath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    return programs_schema_1.programsIndexSchema.parse(parsedYaml);
}
function getProgramPageById(programId) {
    if (!PROGRAM_ID_PATTERN.test(programId)) {
        return null;
    }
    const programsDir = resolveProgramsDir();
    const filePath = node_path_1.default.join(programsDir, `${programId}.yaml`);
    if (!node_fs_1.default.existsSync(filePath)) {
        return null;
    }
    const yamlText = node_fs_1.default.readFileSync(filePath, "utf8");
    const parsedYaml = js_yaml_1.default.load(yamlText);
    const page = programs_schema_1.programPageSchema.parse(parsedYaml);
    if (page.program_id !== programId) {
        return null;
    }
    return page;
}
