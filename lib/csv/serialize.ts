/**
 * RFC 4180 CSV serializer with a UTF-8 BOM so Excel renders Arabic correctly.
 *
 * Rows are objects keyed by column name. Values are converted as follows:
 *   - null / undefined → empty cell
 *   - boolean → "true" / "false"
 *   - Date → ISO string
 *   - Array → joined with "|" (e.g. `["a","b"]` → `"a|b"`)
 *   - Object → JSON.stringify
 *   - everything else → String(value)
 *
 * Cells containing comma, quote, or newline are wrapped in quotes and
 * embedded quotes are doubled.
 */
const BOM = "﻿";
const NEWLINE = "\r\n";

export type CsvValue = unknown;
export type CsvRow = Record<string, CsvValue>;

export function serializeCsv(rows: CsvRow[], columns: string[]): string {
  const lines: string[] = [];
  lines.push(columns.map(escapeCell).join(","));
  for (const row of rows) {
    lines.push(columns.map((col) => escapeCell(formatValue(row[col]))).join(","));
  }
  return BOM + lines.join(NEWLINE) + NEWLINE;
}

function formatValue(v: CsvValue): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.map((x) => String(x)).join("|");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function escapeCell(s: string): string {
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Build a Response object that downloads CSV content as a file.
 * Use from Route Handlers.
 */
export function csvResponse(content: string, filename: string): Response {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/* ----------------------------- typed helpers ----------------------------- */

export function parseBool(s: string | undefined): boolean | null {
  if (s == null || s === "") return null;
  const v = s.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes" || v === "y") return true;
  if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  return null;
}

export function parseInteger(s: string | undefined): number | null {
  if (s == null || s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function parseNumeric(s: string | undefined): number | null {
  if (s == null || s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Parse a pipe-separated value into a string array. */
export function parseArray(s: string | undefined): string[] {
  if (!s || !s.trim()) return [];
  return s.split("|").map((x) => x.trim()).filter(Boolean);
}

/** Parse JSON; return null on failure. */
export function parseJson<T>(s: string | undefined): T | null {
  if (!s || !s.trim()) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}
