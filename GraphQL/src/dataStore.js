const fs = require("node:fs/promises");
const path = require("node:path");

const dataFilePath = path.join(__dirname, "..", "data.txt");

async function readStoredData() {
  try {
    const raw = await fs.readFile(dataFilePath, { encoding: "utf8" });
    return JSON.parse(raw);
  } catch {
    return { input1: "", input2: "" };
  }
}

async function saveStoredData(data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data), { encoding: "utf8" });
  return true;
}

module.exports = {
  readStoredData,
  saveStoredData,
};
