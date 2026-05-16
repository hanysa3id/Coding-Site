// Heuristic auto-SEO derivation from raw markdown content.
// No external API: we strip markdown syntax, then pull the title, the first
// useful paragraph for the meta description, and the most-frequent meaningful
// words as keywords. Conservative on length so search snippets don't truncate.

const STOPWORDS_AR = new Set<string>([
  "من","إلى","في","على","عن","مع","هذا","هذه","ذلك","تلك","التي","الذي",
  "كان","كانت","قد","لا","ما","لم","لن","بين","حيث","كل","بعض","غير",
  "أن","إن","هو","هي","نحن","أنت","أنا","هم","هذه","هؤلاء","ثم","أو",
  "و","يا","لكن","لقد","قبل","بعد","حتى","عند","عندما","لأن","إذا","فقط",
  "أيضا","أيضًا","كما","فيها","فيه","لها","له","لهم","لنا","لي","لك",
]);

const STOPWORDS_EN = new Set<string>([
  "the","a","an","and","or","but","if","then","of","to","in","on","for",
  "with","by","at","from","as","is","are","was","were","be","been","being",
  "this","that","these","those","it","its","they","them","their","you","your",
  "we","our","i","my","he","she","his","her","not","no","yes","do","does",
  "did","done","has","have","had","will","would","can","could","should","may",
  "might","also","just","very","more","most","some","any","all","each","every",
]);

function stripMarkdown(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")          // fenced code
    .replace(/`[^`]*`/g, " ")                  // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")     // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // links → label
    .replace(/^#{1,6}\s+/gm, "")               // headings
    .replace(/^[-*+]\s+/gm, "")                // bullets
    .replace(/^\d+\.\s+/gm, "")                // ordered list
    .replace(/^>\s+/gm, "")                    // blockquote
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1") // bold/italic
    .replace(/~~([^~]+)~~/g, "$1")             // strikethrough
    .replace(/\|/g, " ")                       // table pipes
    .replace(/-{3,}/g, " ")                    // horizontal rules
    .replace(/\s+/g, " ")
    .trim();
}

function firstMeaningfulParagraph(plain: string, minChars = 80): string {
  // Split on sentence punctuation common to both Arabic (.؟!) and English.
  const sentences = plain.split(/(?<=[.!?؟])\s+/).map((s) => s.trim()).filter(Boolean);
  let buffer = "";
  for (const s of sentences) {
    if (buffer.length >= minChars) break;
    buffer = buffer ? `${buffer} ${s}` : s;
  }
  return buffer || plain;
}

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max).trimEnd();
  // Try to end at a word boundary so we don't chop mid-word.
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > max * 0.7 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
}

function topKeywords(plain: string, locale: "ar" | "en", count = 10): string[] {
  const stop = locale === "ar" ? STOPWORDS_AR : STOPWORDS_EN;
  // Keep letters (Arabic + Latin) and digits, drop everything else.
  const tokens = plain
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !stop.has(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
}

export type AutoSeoResult = {
  title: string;
  description: string;
  keywords: string;
  reading_time_minutes: number;
};

export function deriveSeoFromContent(
  title: string,
  content: string | null | undefined,
  locale: "ar" | "en"
): AutoSeoResult {
  const plain = stripMarkdown(content ?? "");
  const description = clamp(
    firstMeaningfulParagraph(plain, 80) || title,
    155
  );
  const keywords = topKeywords(plain, locale).join(", ");
  // ~225 wpm for English, ~200 wpm for Arabic (rough average reading speed).
  const wpm = locale === "ar" ? 200 : 225;
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  const reading_time_minutes = Math.max(1, Math.round(wordCount / wpm));
  return {
    title: clamp(title, 60),
    description,
    keywords,
    reading_time_minutes,
  };
}

export function estimateReadingTime(content: string | null | undefined, locale: "ar" | "en"): number {
  const plain = stripMarkdown(content ?? "");
  const wpm = locale === "ar" ? 200 : 225;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}
