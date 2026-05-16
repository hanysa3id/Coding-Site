/**
 * RFC 4180-compliant CSV parser.
 *
 *   - Handles quoted fields with embedded commas, quotes (escaped as `""`),
 *     and newlines (CR / LF / CRLF).
 *   - Strips the UTF-8 BOM that Excel adds when saving as CSV.
 *   - Tolerates blank trailing rows.
 *
 * Returns a 2D array of strings. Use `rowsToObjects` to map by header.
 */
export function parseCsv(text: string): string[][] {
  if (!text) return [];
  // Strip UTF-8 BOM if present
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
      } else {
        cell += c;
        i++;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
      i++;
    } else if (c === "\r" || c === "\n") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      cell = "";
      row = [];
      i++;
    } else {
      cell += c;
      i++;
    }
  }

  // Last cell / row when there's no trailing newline
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

/**
 * Turns parsed rows into objects using the first row as headers.
 * Skips blank rows (all cells empty).
 */
export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c !== ""))
    .map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] ?? "").trim();
      });
      return obj;
    });
}
