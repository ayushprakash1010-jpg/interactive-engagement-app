// apps/api/src/auth/jwt.strategy.spec.ts

// jwks-rsa pulls in `jose` (ESM) which ts-jest does not transpile. We're
// testing validate(), not the JWKS client, so stub the key provider out.
jest.mock("jwks-rsa", () => ({
  passportJwtSecret: () => (_req: unknown, _token: unknown, done: unknown) =>
    typeof done === "function" &&
    (done as (e: null, k: string) => void)(null, "test-key"),
}));

import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy, JwtPayload } from "./jwt.strategy";
import { UsersService } from "../users/users.service";

/**
 * The strategy constructor reads Auth0 config and configures jwks-rsa; no
 * network call happens until a token is verified. We test validate() in
 * isolation with a stubbed UsersService, since signature/issuer/audience
 * verification is handled by passport-jwt before validate() runs.
 */
function makeStrategy(usersService: Pick<UsersService, "upsert">) {
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

    it("upserts the user and returns the mapped identity", async () => {
      const upsert = jest.fn().mockResolvedValue(baseUser);
      const strategy = makeStrategy({ upsert });

      const payload: JwtPayload = {
        sub: "auth0|abc123",
        name: "Ada Lovelace",
        email: "ada@iep.app",
        aud: "https://api.iep.app",
        iss: "https://example.us.auth0.com/",
        iat: 0,
        exp: 0,
      };

      const result = await strategy.validate(payload);

      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|abc123",
        name: "Ada Lovelace",
        email: "ada@iep.app",
      });
      expect(result).toEqual({
        id: "507f1f77bcf86cd799439011",
        _id: "507f1f77bcf86cd799439011",
        auth0Sub: "auth0|abc123",
        name: "Ada Lovelace",
        email: "ada@iep.app",
        role: "host",
      });
    });

    it("falls back to the namespaced email claim and derives a name", async () => {
      const upsert = jest
        .fn()
        .mockImplementation(({ name, email }) =>
          Promise.resolve({ ...baseUser, name, email }),
        );
      const strategy = makeStrategy({ upsert });

      const payload = {
        sub: "auth0|xyz",
        "https://iep.app/email": "grace@iep.app",
        aud: "https://api.iep.app",
        iss: "https://example.us.auth0.com/",
        iat: 0,
        exp: 0,
      } as JwtPayload;

      await strategy.validate(payload);

      expect(upsert).toHaveBeenCalledWith({
        auth0Sub: "auth0|xyz",
        name: "grace", // derived from the email local-part
        email: "grace@iep.app",
      });
    });

    it("rejects a token with no sub claim", async () => {
      const upsert = jest.fn();
      const strategy = makeStrategy({ upsert });

      await expect(
        strategy.validate({ sub: "" } as JwtPayload),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(upsert).not.toHaveBeenCalled();
    });
  });
});
