export const DEFAULT_PAGE_SIZE = 20;

/**
 * Parse the `page` query string param into a 1-indexed page number,
 * clamping invalid input to 1.
 */
export function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/**
 * Convert a 1-indexed page to Supabase's `.range(from, to)` arguments.
 * Both endpoints are inclusive in Supabase.
 */
export function pageRange(page: number, pageSize: number = DEFAULT_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to, pageSize };
}

/**
 * Total page count given a total row count.
 */
export function totalPages(total: number | null, pageSize: number = DEFAULT_PAGE_SIZE): number {
  if (!total || total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}
