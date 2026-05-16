"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Eye,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "@/components/blog/markdown-preview";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  rows?: number;
  locale: string;
};

export function MarkdownEditor({ value, onChange, placeholder, dir = "ltr", rows = 18, locale }: Props) {
  const isAr = locale === "ar";
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  function wrap(before: string, after = before, defaultText = "") {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function prefixLine(prefix: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length;
      ta.setSelectionRange(pos, pos);
    });
  }

  function insertBlock(block: string) {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const needsNewlineBefore = start > 0 && value[start - 1] !== "\n";
    const prefix = needsNewlineBefore ? "\n\n" : "";
    const next = value.slice(0, start) + prefix + block + "\n" + value.slice(start);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length + block.length + 1;
      ta.setSelectionRange(pos, pos);
    });
  }

  const tools = [
    { icon: Heading1, title: isAr ? "عنوان 1" : "Heading 1", action: () => prefixLine("# ") },
    { icon: Heading2, title: isAr ? "عنوان 2" : "Heading 2", action: () => prefixLine("## ") },
    { icon: Heading3, title: isAr ? "عنوان 3" : "Heading 3", action: () => prefixLine("### ") },
    { icon: Bold, title: isAr ? "غامق" : "Bold", action: () => wrap("**", "**", isAr ? "نص غامق" : "bold text") },
    { icon: Italic, title: isAr ? "مائل" : "Italic", action: () => wrap("*", "*", isAr ? "نص مائل" : "italic text") },
    { icon: Quote, title: isAr ? "اقتباس" : "Quote", action: () => prefixLine("> ") },
    { icon: Code, title: isAr ? "كود" : "Code", action: () => wrap("`", "`", "code") },
    { icon: List, title: isAr ? "قائمة نقطية" : "Bulleted list", action: () => prefixLine("- ") },
    { icon: ListOrdered, title: isAr ? "قائمة مرقمة" : "Numbered list", action: () => prefixLine("1. ") },
    { icon: Link2, title: isAr ? "رابط" : "Link", action: () => wrap("[", "](https://)", isAr ? "نص الرابط" : "link text") },
    { icon: ImageIcon, title: isAr ? "صورة" : "Image", action: () => insertBlock("![alt](https://example.com/image.jpg)") },
    { icon: TableIcon, title: isAr ? "جدول" : "Table", action: () => insertBlock("| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |") },
  ];

  return (
    <div className="rounded-lg border bg-card">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b p-1 flex-wrap">
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <Button
              key={i}
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title={t.title}
              onClick={t.action}
              disabled={mode === "preview"}
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          );
        })}
        <div className="h-6 w-px bg-border mx-1" />
        <Button
          type="button"
          size="sm"
          variant={mode === "write" ? "secondary" : "ghost"}
          className="h-8 px-2 text-xs gap-1"
          onClick={() => setMode("write")}
        >
          <Pencil className="h-3.5 w-3.5" />
          {isAr ? "تحرير" : "Write"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "preview" ? "secondary" : "ghost"}
          className="h-8 px-2 text-xs gap-1"
          onClick={() => setMode("preview")}
        >
          <Eye className="h-3.5 w-3.5" />
          {isAr ? "معاينة" : "Preview"}
        </Button>
      </div>

      {/* Editor / Preview */}
      <div className={cn("p-0", mode === "preview" && "min-h-[200px] p-4")}>
        {mode === "write" ? (
          <Textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            dir={dir}
            rows={rows}
            className="resize-y rounded-t-none border-0 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : value.trim() ? (
          <article
            dir={dir}
            className="prose prose-sm max-w-none dark:prose-invert"
          >
            <MarkdownPreview source={value} />
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isAr ? "لا يوجد محتوى للمعاينة" : "Nothing to preview"}
          </p>
        )}
      </div>
    </div>
  );
}
