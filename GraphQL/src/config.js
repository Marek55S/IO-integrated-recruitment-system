const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not defined`);
  }
  return value;
}

function parsePort(urlValue, envName) {
  try {
    const parsed = new URL(urlValue);
    if (!parsed.port) {
      throw new Error(`${envName} must include an explicit port`);
    }

    const port = Number(parsed.port);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`${envName} contains invalid port`);
    }

    return port;
  } catch (error) {
    throw new Error(`${envName} is not a valid URL: ${error.message}`);
  }
}

const NEXT_APP_URL = requireEnv("NEXT_PUBLIC_NEXT_URL");
const GRAPHQL_URL = requireEnv("NEXT_PUBLIC_GRAPHQL_URL");
const GRAPHQL_PORT = parsePort(GRAPHQL_URL, "NEXT_PUBLIC_GRAPHQL_URL");

module.exports = {
  NEXT_APP_URL,
  GRAPHQL_PORT,
};
