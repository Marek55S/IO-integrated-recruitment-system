const fs = require("node:fs/promises");
const path = require("node:path");

const schemaFilePath = path.join(__dirname, "..", "schema.graphql");

async function loadTypeDefs() {
  return fs.readFile(schemaFilePath, { encoding: "utf8" });
}

module.exports = {
  loadTypeDefs,
};
