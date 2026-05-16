import { NovaSection, NovaSectionHeading } from "../ui/section";

const QUOTES = [
  {
    ar: "تكامل في 30 دقيقة. وفر علينا أسابيع من العمل البرمجي وقدّم نتائج فورية.",
    en: "30-minute integration. Saved us weeks of work and delivered results instantly.",
    name: "Pedro Abrahamson",
    role: "Engineering Lead",
    company: "Helios",
    tint: "from-violet-500 to-purple-600",
  },
  {
    ar: "أفضل تجربة عملت معها هذا العام. الفريق والمنتج كلاهما على مستوى عالٍ.",
    en: "Best experience this year. Both the team and the product are top-tier.",
    name: "Guilherme Baum",
    role: "Product Manager",
    company: "Vertex",
    tint: "from-pink-500 to-rose-500",
  },
  {
    ar: "السرعة، الجودة، والاهتمام بالتفاصيل — كل المعايير التي نبحث عنها متوفرة هنا.",
    en: "Speed, quality, and attention to detail — every criterion we look for is here.",
    name: "Kibet B",
    role: "CTO",
    company: "Atlas",
    tint: "from-cyan-500 to-blue-500",
  },
];

export function NovaTestimonials({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <NovaSection size="lg">
      <NovaSectionHeading
        kicker={isAr ? "آراء العملاء" : "What clients say"}
        title={isAr ? "لا تأخذ كلامنا فقط..." : "Don't just take our word for it..."}
        description={
          isAr
            ? "اسمع مباشرةً من فرق التطوير التي تستخدم منتجاتنا في الإنتاج."
            : "Hear directly from development teams who use our work in production."
        }
      />

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {QUOTES.map((q, i) => {
          const initials = q.name
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("");
          return (
            <article key={i} className="nova-card p-6 space-y-5">
              <p className="text-base text-white/85 leading-relaxed">
                &ldquo;{isAr ? q.ar : q.en}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
                <span
                  className={`grid place-items-center h-9 w-9 rounded-full text-xs font-semibold text-white bg-gradient-to-br ${q.tint}`}
                >
                  {initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{q.name}</p>
                  <p className="text-xs text-white/45 nova-mono">
                    {q.role} · {q.company}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </NovaSection>
  );
}
