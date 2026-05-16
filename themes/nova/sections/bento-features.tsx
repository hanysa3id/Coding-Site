import { NovaSection, NovaSectionHeading } from "../ui/section";
import { Layers, Zap, GitBranch, Users, ShieldCheck, Workflow } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    titleAr: "تفضيلات مرنة",
    titleEn: "Flexible preferences",
    bodyAr: "كل مستخدم يتحكم في طريقة استلامه للإشعارات — بريد، push، أو SMS.",
    bodyEn: "Every user controls how they receive notifications — email, push, or SMS.",
    span: "md:col-span-2",
  },
  {
    icon: Zap,
    titleAr: "في الوقت الفعلي",
    titleEn: "Real-time",
    bodyAr: "تسليم بأقل من 100ms مع تحديثات مباشرة على كل قنوات الإيصال.",
    bodyEn: "Sub-100ms delivery with live updates across every channel.",
    span: "",
  },
  {
    icon: Workflow,
    titleAr: "تدفقات عمل بصرية",
    titleEn: "Workflow builder",
    bodyAr: "محرر بصري للسيناريوهات — شروط، تأخير، فروع — بدون كود.",
    bodyEn: "Visual workflow editor — conditions, delays, branches — no code.",
    span: "",
  },
  {
    icon: GitBranch,
    titleAr: "محرك القوالب",
    titleEn: "Template engine",
    bodyAr: "اكتب قوالب موحدة، واصدر بعدة لغات وقنوات تلقائياً.",
    bodyEn: "Author once, render across languages and channels automatically.",
    span: "md:col-span-2",
  },
  {
    icon: Users,
    titleAr: "إدارة المشتركين",
    titleEn: "Subscribers",
    bodyAr: "مزامنة المشتركين تلقائياً من قاعدة بياناتك، مع تجزئة قوية.",
    bodyEn: "Auto-sync subscribers from your DB with powerful segmentation.",
    span: "",
  },
  {
    icon: ShieldCheck,
    titleAr: "أمان موثّق",
    titleEn: "Secure store",
    bodyAr: "بنية مُؤمَّنة بمعايير SOC 2 وتشفير من الطرف للطرف.",
    bodyEn: "SOC 2-ready architecture with end-to-end encryption.",
    span: "",
  },
];

export function NovaBentoFeatures({ locale }: { locale: string }) {
  const isAr = locale === "ar";

  return (
    <NovaSection size="lg">
      <NovaSectionHeading
        kicker={isAr ? "كل ما تحتاجه" : "Batteries included"}
        title={
          <>
            <span className="nova-tag">&lt;Inbox /&gt;</span>{" "}
            {isAr ? "كل شيء جاهز للعمل" : "everything ready out of the box"}
          </>
        }
        description={
          isAr
            ? "مكتبة كاملة، بقطعة كود واحدة. مرونة كاملة لتخصيص تجربتك الفريدة."
            : "A full toolkit in a single import. Total flexibility to craft your unique experience."
        }
      />

      <div className="mt-16 grid gap-4 md:grid-cols-3 [&>*]:min-h-[200px]">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`nova-card p-6 space-y-4 ${f.span} ${i === 0 ? "nova-card-glow" : ""}`}
            >
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-purple-700/15 border border-violet-400/20">
                <Icon className="h-5 w-5 text-violet-200" />
              </span>
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {isAr ? f.titleAr : f.titleEn}
              </h3>
              <p className="text-sm text-white/55 leading-relaxed">
                {isAr ? f.bodyAr : f.bodyEn}
              </p>
            </div>
          );
        })}
      </div>
    </NovaSection>
  );
}
