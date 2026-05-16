"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Lightweight markdown renderer used by both the editor preview and the
// public post page. We pass remark-gfm for tables, task lists, and
// strikethrough. We don't enable raw HTML by default to keep content safe.
export function MarkdownPreview({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
  );
}
