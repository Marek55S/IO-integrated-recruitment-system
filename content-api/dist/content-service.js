"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormConfig = getFormConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const form_schema_1 = require("./form-schema");
const CONTENT_CANDIDATE_PATHS = [
    node_path_1.default.resolve(process.cwd(), '../content-api/content/recruitment-form.yaml'),
    node_path_1.default.resolve(process.cwd(), '../content-api/content/base-data-form.pl.yaml'),
    node_path_1.default.resolve(__dirname, '../content/recruitment-form.yaml'),
    node_path_1.default.resolve(__dirname, '../content/base-data-form.pl.yaml'),
];
function resolveContentPath() {
    const filePath = CONTENT_CANDIDATE_PATHS.find((candidatePath) => node_fs_1.default.existsSync(candidatePath));
    if (!filePath) {
        throw new Error(`Could not find YAML form config. Tried: ${CONTENT_CANDIDATE_PATHS.join(', ')}`);
    }
    return filePath;
}
function getFormConfig() {
    const filePath = resolveContentPath();
    const yamlText = node_fs_1.default.readFileSync(filePath, 'utf8');
    const parsedYaml = js_yaml_1.default.load(yamlText);
    return form_schema_1.formConfigSchema.parse(parsedYaml);
}
