import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadEventsCsv } from "./page";

type Event = {
  id: string;
  ledger: number;
  created_at: string;
  agent: string;
  subject: string;
  score: number;
  contract_id: string;
};

function readBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

function readBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

function unquote(cell: string) {
  return cell.replace(/^"/, "").replace(/"$/, "");
}

let exported: Blob | null = null;

beforeEach(() => {
  exported = null;
  (URL as unknown as { createObjectURL: (blob: Blob) => string }).createObjectURL = (blob: Blob) => {
    exported = blob;
    return "blob:events";
  };
  (URL as unknown as { revokeObjectURL: (url: string) => void }).revokeObjectURL = () => {};
});

afterEach(() => {
  vi.restoreAllMocks();
});

function exportBlob(events: Event[]) {
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  downloadEventsCsv(events);
  if (!exported) throw new Error("downloadEventsCsv did not create a blob URL");
  return exported;
}

const events: Event[] = [
  {
    id: "evt-1",
    ledger: 100,
    created_at: "2026-01-02T03:04:05Z",
    agent: "=SUM(A1)",
    subject: 'GABC, "quoted"',
    score: 42,
    contract_id: "@CMD",
  },
  {
    id: "evt-2",
    ledger: 200,
    created_at: "2026-01-03T00:00:00Z",
    agent: "+plus",
    subject: "-minus",
    score: 7,
    contract_id: "line1\nline2",
  },
];

describe("downloadEventsCsv", () => {
  it("writes the expected header fields", async () => {
    const csv = await readBlob(exportBlob(events));
    const header = csv.replace(/^\uFEFF/, "").split("\r\n")[0].split(",").map(unquote);
    expect(header).toEqual(["event_id", "ledger", "created_at", "agent", "account", "score", "contract_id"]);
  });

  it("doubles embedded double quotes inside quoted cells", async () => {
    const csv = await readBlob(exportBlob(events));
    expect(csv).toContain('"GABC, ""quoted"""');
  });

  it("prefixes formula-injection cells with a single apostrophe", async () => {
    const csv = await readBlob(exportBlob(events));
    expect(csv).toContain("\"'=SUM(A1)\"");
    expect(csv).toContain("\"'+plus\"");
    expect(csv).toContain("\"'@CMD\"");
    expect(csv).toContain("\"'-minus\"");
  });

  it("prefixes a UTF-8 BOM and joins rows with CRLF", async () => {
    const blob = exportBlob(events);
    const bytes = await readBytes(blob);
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
    const csv = await readBlob(blob);
    expect(csv).toContain("\r\n");
  });

  it("preserves an embedded newline inside a quoted cell", async () => {
    const csv = await readBlob(exportBlob(events));
    expect(csv).toContain('"line1\nline2"');
  });

  it("does not apostrophe-escape numeric ledger and score cells", async () => {
    const csv = await readBlob(exportBlob(events));
    expect(csv).toContain('"100"');
    expect(csv).toContain('"42"');
    expect(csv).not.toContain("'100");
    expect(csv).not.toContain("'42");
  });
});
