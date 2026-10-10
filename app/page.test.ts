import { describe, expect, it } from "vitest";

import { isStellarPublicKeyFormat, shortAddress } from "./page";

const VALID_KEY = `G${"A".repeat(55)}`;

describe("isStellarPublicKeyFormat", () => {
  it("accepts a 56-character G-prefixed base32 public key", () => {
    expect(isStellarPublicKeyFormat(VALID_KEY)).toBe(true);
  });

  it("rejects malformed keys", () => {
    expect(isStellarPublicKeyFormat("")).toBe(false);
    expect(isStellarPublicKeyFormat(VALID_KEY.slice(0, -1))).toBe(false);
    expect(isStellarPublicKeyFormat(`g${"A".repeat(55)}`)).toBe(false);
    expect(isStellarPublicKeyFormat(`S${"A".repeat(55)}`)).toBe(false);
    expect(isStellarPublicKeyFormat(`G${"1".repeat(55)}`)).toBe(false);
  });
});

describe("shortAddress", () => {
  it("truncates an address longer than 18 characters", () => {
    expect(shortAddress(VALID_KEY)).toBe(`${VALID_KEY.slice(0, 8)}…${VALID_KEY.slice(-6)}`);
  });

  it("leaves a short value unchanged", () => {
    expect(shortAddress("GSHORT")).toBe("GSHORT");
  });
});
