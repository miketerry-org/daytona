const path = require("path");
const { spawnSync } = require("child_process");

const environmentJsPath = path.resolve(__dirname, "../src/lib/environment.js");

function runEnvironmentWithEnv(envVars = {}) {
  const result = spawnSync("node", [environmentJsPath], {
    env: {
      ...process.env,
      ...envVars,
      RUN_ENV_MAIN: "true", // Forces main() to run
    },
    encoding: "utf-8",
  });

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

describe("environment.js", () => {
  const baseEnv = {
    ENCRYPT_KEY: "dummy_key",
    NODE: "dummy_node",
  };

  const testCases = [
    { NODE_ENV: "development", expected: { isDevelopment: true } },
    { NODE_ENV: "dev", expected: { isDevelopment: true } },
    { NODE_ENV: "production", expected: { isProduction: true } },
    { NODE_ENV: "prod", expected: { isProduction: true } },
    { NODE_ENV: "test", expected: { isTesting: true } },
    { NODE_ENV: "testing", expected: { isTesting: true } },
    { NODE_ENV: "debug", expected: { isDebug: true } },
    { NODE_ENV: "debugging", expected: { isDebug: true } },
    { NODE_ENV: undefined, expected: { isProduction: true } }, // default
  ];

  testCases.forEach(({ NODE_ENV, expected }) => {
    const label = NODE_ENV || "undefined (defaults to production)";

    test(`sets correct flags for NODE_ENV=${label}`, () => {
      const result = runEnvironmentWithEnv({
        NODE_ENV,
        ...baseEnv,
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Environment mode:");

      for (const key of [
        "isDevelopment",
        "isProduction",
        "isTesting",
        "isDebug",
      ]) {
        if (expected[key]) {
          expect(result.stdout).toContain(key);
        }
      }
    });
  });

  test("exits if ENCRYPT_KEY is missing", () => {
    const result = runEnvironmentWithEnv({
      NODE_ENV: "development",
      NODE: "dummy_node",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("ENCRYPT_KEY is required");
  });

  test("exits if NODE is missing", () => {
    const result = runEnvironmentWithEnv({
      NODE_ENV: "development",
      ENCRYPT_KEY: "dummy_key",
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("NODE is required");
  });

  test("exits on invalid NODE_ENV", () => {
    const result = runEnvironmentWithEnv({
      NODE_ENV: "garbage_env",
      ...baseEnv,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Unrecognized NODE_ENV");
  });

  test("dotenv is NOT used in production", () => {
    const result = runEnvironmentWithEnv({
      NODE_ENV: "production",
      ENCRYPT_KEY: "dummy_key",
      NODE: "dummy_node",
      _DOTENV_LOADED: "true", // simulate misuse
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("dotenv should NOT be used");
  });
});
