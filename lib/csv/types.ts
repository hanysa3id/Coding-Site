export type ImportError = {
  row: number;
  message: string;
};

export type ImportResult = {
  success: boolean;
  inserted: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
};

export type ExportResult =
  | { success: true; csv: string; filename: string }
  | { success: false; error: string };
