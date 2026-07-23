// apps/api/src/auth/jwt.strategy.spec.ts
/* eslint-env jest */

jest.mock("jwks-rsa", () => ({
  passportJwtSecret: () => (_req: unknown, _token: unknown, done: unknown) =>
    typeof done === "function" &&
    (done as (e: null, k: string) => void)(null, "test-key"),
}));

jest.mock('passport-jwt', () => ({
  Strategy: class {
    name = 'jwt';
    constructor(options: any) {}
  },
  ExtractJwt: {
    fromAuthHeaderAsBearerToken: () => () => 'mocked-token',
  },
}));

import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy, JwtPayload } from "./jwt.strategy";
import { UsersService } from "../users/users.service";
import type { Request } from "express";

function makeStrategy(usersService: Pick<UsersService, "upsert" | "findByAuth0Sub">) {
  const config = {
    getOrThrow: (key: string) =>
      key === "AUTH0_ISSUER_BASE_URL"
        ? "https://example.us.auth0.com"
        : "https://api.iep.app",
  } as unknown as ConfigService;

  return new JwtStrategy(config, usersService as UsersService);
}

describe("JwtStrategy", () => {
  describe("constructor", () => {
    it("throws if required Auth0 config is missing", () => {
      const config = {
        getOrThrow: (key: string) => {
          throw new Error(`Missing ${key}`);
        },
      } as unknown as ConfigService;

      expect(() => new JwtStrategy(config, {} as UsersService)).toThrow(
        /Missing AUTH0_ISSUER_BASE_URL/,
      );
    });
  });

  describe("validate", () => {
    const baseUser = {
      _id: { toString: () => "507f1f77bcf86cd799439011" },
      auth0Sub: "auth0|abc123",
      name: "Ada Lovelace",
      email: "ada@iep.app",
      role: "host" as const,
    };
    
    const fallbackUser = {
      _id: { toString: () => "507f1f77bcf86cd799439012" },
      auth0Sub: "auth0|abc123",
      name: "auth0|abc123",
      email: "auth0|abc123@users.noreply.iep",
      role: "host" as const,
      organizationId: { toString: () => "org-1" },
      isSuspended: false
    };

    const req = {} as Request;
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
      originalFetch = global.fetch;
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("Priority 1: Existing MongoDB real profile (skips /userinfo and skipProfileUpdate=true)", async () => {
      const upsert = jest.fn().mockResolvedValue(baseUser);
      const findByAuth0Sub = jest.fn().mockResolvedValue(baseUser);
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      const payload = { sub: "auth0|abc123" } as JwtPayload;

      global.fetch = jest.fn();

      const result = await strategy.validate(req, payload);

      expect(findByAuth0Sub).toHaveBeenCalledWith("auth0|abc123");
      expect(global.fetch).not.toHaveBeenCalled();
      
      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "Ada Lovelace",
        email: "ada@iep.app",
      }, { skipProfileUpdate: true });

      // Verifies id mapping
      expect(result.id).toBe("507f1f77bcf86cd799439011");
      expect(result.role).toBe("host");
    });

    it("Priority 2: Trusted JWT claims (skips /userinfo and skipProfileUpdate=false)", async () => {
      const upsert = jest.fn().mockResolvedValue(baseUser);
      const findByAuth0Sub = jest.fn().mockResolvedValue(fallbackUser);
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      const payload = { 
        sub: "auth0|abc123",
        email: "token@email.com",
        name: "Token Name",
        email_verified: true
      } as JwtPayload;

      global.fetch = jest.fn();

      const result = await strategy.validate(req, payload);

      expect(global.fetch).not.toHaveBeenCalled();
      
      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "Token Name",
        email: "token@email.com",
      }, { skipProfileUpdate: false });
      
      expect(result.emailVerified).toBe(true);
    });

    it("Priority 3: /userinfo succeeds and upgrades fallback (preserves roles/ids)", async () => {
      // Return a user from upsert with exactly the same _id, role, organization as the fallback
      const upgradedUser = { ...fallbackUser, email: "real@email.com", name: "Real Name" };
      const upsert = jest.fn().mockResolvedValue(upgradedUser);
      const findByAuth0Sub = jest.fn().mockResolvedValue(fallbackUser);
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      const payload = { sub: "auth0|abc123" } as JwtPayload;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ email: 'real@email.com', name: 'Real Name' })
      } as Response);

      const result = await strategy.validate(req, payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "Real Name",
        email: "real@email.com",
      }, { skipProfileUpdate: false });

      // Verifies authorization state mapping is strictly derived from the upsert result
      expect(result._id).toBe("507f1f77bcf86cd799439012");
      expect(result.role).toBe("host");
      expect(result.organizationId).toBe("org-1");
    });

    it("Priority 4: Fallback gracefully handles /userinfo failure and caches the failure", async () => {
      const upsert = jest.fn().mockResolvedValue(fallbackUser);
      const findByAuth0Sub = jest.fn().mockResolvedValue(fallbackUser);
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      const payload = { sub: "auth0|abc123" } as JwtPayload;

      // Fail the first call
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: "Too Many Requests"
      } as Response);

      await strategy.validate(req, payload);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // skipProfileUpdate is true because DB already has the exact fallback
      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "auth0|abc123",
        email: "auth0|abc123@users.noreply.iep",
      }, { skipProfileUpdate: true });

      // Simulate a second request immediately after
      jest.clearAllMocks();
      
      await strategy.validate(req, payload);
      
      // Should hit the failure cache and skip calling fetch
      expect(global.fetch).not.toHaveBeenCalled();
      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "auth0|abc123",
        email: "auth0|abc123@users.noreply.iep",
      }, { skipProfileUpdate: true });
    });

    it("logs warning if explicitly email_verified is false", async () => {
      const upsert = jest.fn().mockResolvedValue(baseUser);
      const findByAuth0Sub = jest.fn().mockResolvedValue(fallbackUser);
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      const payload = { sub: "auth0|abc123" } as JwtPayload;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ email: 'real@email.com', name: 'Real Name', email_verified: false })
      } as Response);

      const loggerWarnSpy = jest.spyOn((strategy as any).logger, 'warn');

      await strategy.validate(req, payload);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("unverified email: real@email.com")
      );
    });

    it("rejects a token with no sub claim", async () => {
      const upsert = jest.fn();
      const findByAuth0Sub = jest.fn();
      const strategy = makeStrategy({ upsert, findByAuth0Sub });

      await expect(
        strategy.validate(req, { sub: "" } as JwtPayload),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(upsert).not.toHaveBeenCalled();
    });
  });
});
