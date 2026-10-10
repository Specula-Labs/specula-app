import { describe, expect, it } from "vitest";

import { explorerUrl, networkName } from "./page";

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
const PUBLIC_PASSPHRASE = "Public Global Stellar Network ; September 2015";

describe("explorerUrl", () => {
  it("builds testnet explorer URLs for account, contract and transaction references", () => {
    expect(explorerUrl(TESTNET_PASSPHRASE, "account", "GABC")).toBe(
      "https://stellar.expert/explorer/testnet/account/GABC",
    );
    expect(explorerUrl(TESTNET_PASSPHRASE, "contract", "CABC")).toBe(
      "https://stellar.expert/explorer/testnet/contract/CABC",
    );
    expect(explorerUrl(TESTNET_PASSPHRASE, "tx", "deadbeef")).toBe(
      "https://stellar.expert/explorer/testnet/tx/deadbeef",
    );
  });

  it("builds public explorer URLs for account, contract and transaction references", () => {
    expect(explorerUrl(PUBLIC_PASSPHRASE, "account", "GABC")).toBe(
      "https://stellar.expert/explorer/public/account/GABC",
    );
    expect(explorerUrl(PUBLIC_PASSPHRASE, "contract", "CABC")).toBe(
      "https://stellar.expert/explorer/public/contract/CABC",
    );
    expect(explorerUrl(PUBLIC_PASSPHRASE, "tx", "deadbeef")).toBe(
      "https://stellar.expert/explorer/public/tx/deadbeef",
    );
  });

  it("URI-encodes the address segment", () => {
    expect(explorerUrl(TESTNET_PASSPHRASE, "account", "G A/B")).toBe(
      "https://stellar.expert/explorer/testnet/account/G%20A%2FB",
    );
  });

  it("returns null when the network is unrecognised or missing", () => {
    expect(explorerUrl("some other network", "account", "GABC")).toBeNull();
    expect(explorerUrl(undefined, "account", "GABC")).toBeNull();
  });

  it("returns null when the value is empty", () => {
    expect(explorerUrl(TESTNET_PASSPHRASE, "account", "")).toBeNull();
  });
});

describe("networkName", () => {
  it("labels the canonical testnet and public passphrases", () => {
    expect(networkName(TESTNET_PASSPHRASE)).toBe("Testnet");
    expect(networkName(PUBLIC_PASSPHRASE)).toBe("Public network");
  });

  it("returns an unrecognised passphrase verbatim", () => {
    expect(networkName("Local Standalone Network")).toBe("Local Standalone Network");
  });

  it("falls back when the passphrase is missing", () => {
    expect(networkName(undefined)).toBe("Stellar network");
  });
});
