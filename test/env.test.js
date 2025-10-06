"use strict";

describe("Environment (env.js)", () => {
  const ORIGINAL_ENV = process.env;
  const VALID_KEY = "A".repeat(64);
  const VALID_MODES = [
    ["prod", "prod", true, false, false, false],
    ["production", "production", true, false, false, false],
    ["dev", "dev", false, true, false, false],
    ["development", "development", false, true, false, false],
    ["debug", "debug", false, false, true, false],
    ["debugging", "debugging", false, false, true, false],
    ["test", "test", false, false, false, true],
    ["testing", "testing", false, false, false, true],
  ];

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
    jest.spyOn(console, "log").mockImplementation(() => {});

    // Clear the singleton cache
    const envModule = require("../src/utils/env");
    if (envModule._clearEnvSingleton) {
      envModule._clearEnvSingleton();
    }
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    if (console.log.mockRestore) {
      console.log.mockRestore();
    }
  });

  function newEnvInstance() {
    const { Environment } = require("../src/utils/env");
    return new Environment();
  }

  describe("happy paths for valid NODE_ENV and encryption key", () => {
    it.each(VALID_MODES)(
      "NODE_ENV=%s → mode=%s, flags = %p/%p/%p/%p",
      (
        inputEnv,
        expectedMode,
        expectProd,
        expectDev,
        expectDebug,
        expectTest
      ) => {
        process.env.NODE_ENV = inputEnv;
        process.env.ENCRYPT_KEY = VALID_KEY;

        const env = newEnvInstance();

        expect(env.mode).toBe(expectedMode);
        expect(env.production).toBe(expectProd);
        expect(env.development).toBe(expectDev);
        expect(env.debugging).toBe(expectDebug);
        expect(env.testing).toBe(expectTest);
        expect(env.encryptKey).toBe(VALID_KEY);
      }
    );
  });

  describe("singleton env access", () => {
    it("returns the same instance across calls", () => {
      process.env.NODE_ENV = "test";
      process.env.ENCRYPT_KEY = VALID_KEY;

      const { env } = require("../src/utils/env");
      const instance1 = env;
      const instance2 = require("../src/utils/env").env;

      expect(instance1).toBe(instance2);
    });

    it("throws and caches error if initialization fails", () => {
      process.env.NODE_ENV = "invalid";
      delete process.env.ENCRYPT_KEY;

      const envModule = require("../src/utils/env");
      envModule._clearEnvSingleton();

      // First access throws
      expect(() => envModule.env).toThrow(/Invalid NODE_ENV value/i);

      // Second access throws the same cached error
      expect(() => envModule.env).toThrow(/Invalid NODE_ENV value/i);
    });
  });

  describe("defaults when NODE_ENV is missing or blank", () => {
    it("defaults to production when NODE_ENV is undefined", () => {
      delete process.env.NODE_ENV;
      process.env.ENCRYPT_KEY = VALID_KEY;

      const env = newEnvInstance();
      expect(env.mode).toBe("production");
      expect(env.production).toBe(true);
    });

    it("defaults to production when NODE_ENV is blank", () => {
      process.env.NODE_ENV = "   ";
      process.env.ENCRYPT_KEY = VALID_KEY;

      const env = newEnvInstance();
      expect(env.mode).toBe("production");
      expect(env.production).toBe(true);
    });
  });

  describe("invalid NODE_ENV", () => {
    it("throws on invalid mode", () => {
      process.env.NODE_ENV = "not_a_valid_mode";
      process.env.ENCRYPT_KEY = VALID_KEY;

      expect(() => newEnvInstance()).toThrow(/Invalid NODE_ENV value/i);
    });
  });

  describe("ENCRYPT_KEY validations", () => {
    it("throws when missing", () => {
      process.env.NODE_ENV = "test";
      delete process.env.ENCRYPT_KEY;

      const { _clearEnvSingleton } = require("../src/utils/env");
      _clearEnvSingleton();

      const { Environment } = require("../src/utils/env");

      expect(() => new Environment()).toThrow(/missing/i);
    });

    it("throws when too short", () => {
      process.env.NODE_ENV = "test";
      process.env.ENCRYPT_KEY = "short";

      expect(() => newEnvInstance()).toThrow(/must have a length of 64/i);
    });

    it("throws when too long", () => {
      process.env.NODE_ENV = "test";
      process.env.ENCRYPT_KEY = "A".repeat(65);

      expect(() => newEnvInstance()).toThrow(/must have a length of 64/i);
    });

    it("accepts key with whitespace if trimmed length is valid", () => {
      process.env.NODE_ENV = "test";
      process.env.ENCRYPT_KEY = " " + "B".repeat(64) + " ";

      const env = newEnvInstance();

      expect(env.encryptKey).toBe(process.env.ENCRYPT_KEY);
    });
  });
});
