"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary that wraps the <html> tag itself.
 * Fires only when the root layout throws — most errors are caught
 * by the per-segment error.tsx files instead.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Future: integrate Sentry here once installed
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          margin: 0,
          backgroundColor: "#fafafa",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ color: "#666", marginBottom: 24 }}>
            نعتذر عن هذا الخلل. حاول مرة أخرى أو عُد للصفحة الرئيسية.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: "#999",
                fontFamily: "monospace",
                marginBottom: 24,
              }}
            >
              {error.digest}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "8px 16px",
                background: "#000",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              المحاولة مرة أخرى
            </button>
            <a
              href="/"
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                borderRadius: 6,
                textDecoration: "none",
                color: "#000",
                fontSize: 14,
              }}
            >
              الصفحة الرئيسية
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
