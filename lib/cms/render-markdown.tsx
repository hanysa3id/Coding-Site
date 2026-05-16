/**
 * Tiny CMS-targeted Markdown renderer.
 *
 * Avoids pulling in `react-markdown` since CMS content is admin-authored and
 * we only need a small subset. Supports:
 *   - # h1, ## h2, ### h3
 *   - **bold**, *italic*
 *   - `inline code`
 *   - [text](url) links — only http(s) URLs are kept
 *   - - bullet lists
 *   - 1. ordered lists
 *   - --- horizontal rules
 *   - paragraphs separated by blank lines
 *
 * Output is rendered via `dangerouslySetInnerHTML` after HTML-escaping all
 * raw user input. That way no `<script>` from admin content can execute.
 */

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escape(html: string): string {
  return html.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

function renderInline(text: string): string {
  // escape first so user HTML can't break out
  let out = escape(text);
  // links: [label](http(s)://...)
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_, label: string, href: string) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="underline text-primary hover:opacity-80">${label}</a>`
  );
  // bold **x**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // italic *x*
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // inline code `x`
  out = out.replace(
    /`([^`]+)`/g,
    '<code class="px-1 py-0.5 rounded bg-muted text-sm">$1</code>'
  );
  return out;
}

export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let buf: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushParagraph() {
    if (buf.length === 0) return;
    html.push(`<p class="leading-relaxed mb-4">${renderInline(buf.join(" "))}</p>`);
    buf = [];
  }
  function flushList() {
    if (listType === null) return;
    html.push(`</${listType}>`);
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Headings
    let m;
    if ((m = /^#\s+(.*)$/.exec(line))) {
      flushParagraph();
      flushList();
      html.push(
        `<h1 class="text-3xl font-bold mt-8 mb-4">${renderInline(m[1])}</h1>`
      );
      continue;
    }
    if ((m = /^##\s+(.*)$/.exec(line))) {
      flushParagraph();
      flushList();
      html.push(
        `<h2 class="text-2xl font-semibold mt-6 mb-3">${renderInline(m[1])}</h2>`
      );
      continue;
    }
    if ((m = /^###\s+(.*)$/.exec(line))) {
      flushParagraph();
      flushList();
      html.push(
        `<h3 class="text-xl font-semibold mt-5 mb-2">${renderInline(m[1])}</h3>`
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line)) {
      flushParagraph();
      flushList();
      html.push('<hr class="my-6 border-muted" />');
      continue;
    }

    // Unordered list
    if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        html.push('<ul class="list-disc ms-6 mb-4 space-y-1">');
        listType = "ul";
      }
      html.push(`<li>${renderInline(m[1])}</li>`);
      continue;
    }

    // Ordered list
    if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        html.push('<ol class="list-decimal ms-6 mb-4 space-y-1">');
        listType = "ol";
      }
      html.push(`<li>${renderInline(m[1])}</li>`);
      continue;
    }

    // Paragraph buffer
    if (listType) flushList();
    buf.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}
