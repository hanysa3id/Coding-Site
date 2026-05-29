import type {
  LandingPricingPlan,
  LandingProcessStep,
  LandingServicePillar,
} from "@/lib/validators/settings";
import type { SectionItem } from "@/lib/validators/section-content";

// ─── Features — "Why are we different?" (لماذا نحن مختلفون) ───────────────
// Items mirror what the Pro theme renders by default for the features bento grid.
export const defaultFeatureItems: SectionItem[] = [
  {
    id: "f1",
    title_ar: "أداء فائق السرعة وبلا انقطاع",
    title_en: "Ultra-Fast Performance",
    description_ar:
      "مواقع سريعة الاستجابة تحقق أعلى تقييمات في Core Web Vitals لضمان أفضل تجربة للمستخدم وأعلى تصدر بمحركات البحث.",
    description_en:
      "Engineered for maximum loading speed, passing Core Web Vitals checks out-of-the-box to enhance search ranks.",
    badge_en: "LCP < 1.2s",
    badge_ar: "أقل من ثانية",
    icon_name: "Zap",
  },
  {
    id: "f2",
    title_ar: "بنية هندسية متكاملة",
    title_en: "Clean Code Architecture",
    description_ar:
      "نعتمد على لغات برمجية حديثة وبنى هندسية مرنة وقابلة للتطوير المستقبلي بيسر.",
    description_en:
      "Enterprise-grade component mapping built with robust TypeScript modular structures.",
    badge_en: "TypeScript",
    badge_ar: "كود نظيف",
    icon_name: "Cpu",
  },
  {
    id: "f3",
    title_ar: "أمان وحماية قصوى للمعلومات",
    title_en: "Continuous Security Audits",
    description_ar:
      "نطبق أعلى بروتوكولات الأمان العالمية مع فحوصات واختبارات حية دورية لحماية مشروعك وبيانات عملائك.",
    description_en:
      "Robust compliance frameworks, standard authentication encryption protocols, and zero data leakage pipelines.",
    badge_en: "SSL Protected",
    badge_ar: "حماية 100%",
    icon_name: "ShieldCheck",
  },
  {
    id: "f4",
    title_ar: "واجهات مرنة وتجربة بصرية فريدة",
    title_en: "Fully Adaptive Cross-Device",
    description_ar:
      "تصميمات متوافقة ومتجاوبة بنسبة 100% مع كافة الشاشات وأجهزة الهواتف والأجهزة اللوحية لتوفير واجهة مستخدم مريحة.",
    description_en:
      "Layout scaling optimized automatically for mobile devices, screens, tablets, and high-DPI displays.",
    badge_en: "100% Responsive",
    badge_ar: "متجاوب بالكامل",
    icon_name: "Layers",
  },
];

// ─── Services pillars — Build / Grow / Maintain (خدماتنا الاحترافية) ──────
export const defaultServicePillars: LandingServicePillar[] = [
  {
    id: "pillar-build",
    bucket: "build",
    title_ar: "🚀 هندسة وبناء المنتجات (Build)",
    title_en: "🚀 Build & Engineer",
    description_ar:
      "برمجة وبناء وتصميم الأنظمة والمنصات الرقمية بأقوى البنى الهندسية المعاصرة.",
    description_en:
      "Building robust backend systems, frontend client apps, and high-converting UI blueprints.",
    icon_name: "Code2",
    glow_color: "rgba(6, 182, 212, 0.25)",
  },
  {
    id: "pillar-grow",
    bucket: "grow",
    title_ar: "📈 تسويق ومضاعفة النمو (Grow)",
    title_en: "📈 Scale & Grow",
    description_ar:
      "إدارة وتخطيط الحملات الإعلانية ومحركات البحث لزيادة عدد عملائك ومبيعاتك.",
    description_en:
      "Performance marketing, conversion funnel architecture, ads management, and brand scaling.",
    icon_name: "TrendingUp",
    glow_color: "rgba(16, 185, 129, 0.25)",
  },
  {
    id: "pillar-maintain",
    bucket: "maintain",
    title_ar: "🛠 تشغيل وصيانة مستمرة (Maintain)",
    title_en: "🛠 Support & Maintain",
    description_ar:
      "استضافات سحابية آمنة، اختبارات حقيقية للجودة ودعم فني متواصل 24/7.",
    description_en:
      "DevOps cloud scaling, QA automation, secure staging audits, and permanent code support.",
    icon_name: "CloudLightning",
    glow_color: "rgba(251, 191, 36, 0.25)",
  },
];

// ─── Process steps — "How We Work" (منهجيتنا في العمل) ────────────────────
export const defaultProcessSteps: LandingProcessStep[] = [
  {
    id: "step-1",
    icon_name: "ClipboardList",
    title_ar: "التخطيط ودرء المخاطر",
    title_en: "Strategy & Risk Assessment",
    description_ar:
      "نجتمع لمناقشة أهدافك وتحليل المتطلبات لتحديد نطاق عمل وهيكل واضح وتفادي العقبات مبكراً.",
    description_en:
      "Initial brainstorming sessions, target definition, architectural planning, and technology selection.",
  },
  {
    id: "step-2",
    icon_name: "LayoutTemplate",
    title_ar: "التصميم وتجربة المستخدم",
    title_en: "UX/UI Wireframing & Prototypes",
    description_ar:
      "تصميم واجهات المستخدم البصرية وإعداد هياكل تفاعلية توضح رحلة المستخدم بالتفصيل قبل البرمجة.",
    description_en:
      "Interactive digital blueprint mockups designed explicitly to maximize visual user conversion paths.",
  },
  {
    id: "step-3",
    icon_name: "Braces",
    title_ar: "البرمجة والتطوير الفعلي",
    title_en: "Development & Engineering",
    description_ar:
      "كتابة كود برمجي متناسق ونظيف متوافق مع خوارزميات البحث السريع ومناسب للتطوير والتوسع المستقبلي.",
    description_en:
      "Modern client framework styling, server logic coding, database indexing, and strict clean standards.",
  },
  {
    id: "step-4",
    icon_name: "ShieldAlert",
    title_ar: "فحص الجودة والأمان",
    title_en: "Quality Audits & Security Checks",
    description_ar:
      "إخضاع الكود والمنصة لاختبارات جودة وأمان صارمة وتصحيح الثغرات البرمجية لضمان سلامة موقعك.",
    description_en:
      "Automated end-to-end integration tests, safety audits, and cross-browser responsive sanity reviews.",
  },
  {
    id: "step-5",
    icon_name: "Cloud",
    title_ar: "الإطلاق والتهيئة السحابية",
    title_en: "Cloud Deploy & Server Setup",
    description_ar:
      "تهيئة السيرفرات السحابية وإعداد شبكات توزيع المحتوى العالمية CDN لإطلاق آمن وسريع للمشروع.",
    description_en:
      "DevOps production pipelines launch, SSL certification binding, and high-availability setups.",
  },
  {
    id: "step-6",
    icon_name: "LineChart",
    title_ar: "التحليل والتطوير المستمر",
    title_en: "Continuous Scaling & SEO Optimize",
    description_ar:
      "تتبع سلوك الزوار وتحليل الأرقام وتحسين سرعة الصفحة لرفع الترتيب بمحركات البحث ومضاعفة المبيعات.",
    description_en:
      "Weekly analytics audits, SEO keywords tweaks, performance monitoring, and organic traffic upgrades.",
  },
];

// ─── Pricing plans (الأسعار) ──────────────────────────────────────────────
export const defaultPricingPlans: LandingPricingPlan[] = [
  {
    id: "plan-startup",
    name_ar: "باقة التشغيل والبدء",
    name_en: "Startup Launch",
    description_ar:
      "مثالية لإطلاق أول مشروع ويب أو صفحة هبوط لشركتك الناشئة.",
    description_en:
      "Perfect for launching a custom high-performance landing page or MVP.",
    price_monthly: 499,
    price_yearly: 399,
    features_ar: [
      "تصميم وتطوير صفحة هبوط مخصصة",
      "لوحة تحكم إدارة محتوى مصغرة",
      "تهيئة مجانية لأمان SSL وسرعة CDN",
      "دعم فني وتعديلات مجانية لمدة شهر",
      "تكامل مباشر مع الواتساب وبوابات الاتصال",
    ],
    features_en: [
      "Single-page responsive design & code",
      "Sleek CMS control dashboard",
      "Free SSL validation & CDN routing",
      "1 month technical maintenance warranty",
      "WhatsApp call-to-action triggers",
    ],
    is_popular: false,
    cta_label_ar: "اختر باقة البدء",
    cta_label_en: "Get Startup Track",
  },
  {
    id: "plan-business",
    name_ar: "باقة الأعمال والنمو",
    name_en: "Business Scale",
    description_ar:
      "منظومة رقمية متكاملة لشركات الخدمات الراغبة بالنمو السريع والتوسع.",
    description_en:
      "Comprehensive digital systems for expanding agencies and platforms.",
    price_monthly: 1299,
    price_yearly: 999,
    features_ar: [
      "موقع متعدد الصفحات ونظام إدارة محتوى كامل",
      "تصميمات واجهات مخصصة UX/UI متميزة",
      "تكامل بوابات دفع فيزا / ماستر / المحافظ",
      "تحليل وحملات تسويقية SEO وإدارة إعلانات",
      "دعم فني وحل مشاكل متواصل لمدة 3 أشهر",
      "اختبارات جودة QA وفحص أمان شامل للموقع",
    ],
    features_en: [
      "Multi-page dynamic custom architecture",
      "Advanced custom UX/UI blueprints",
      "Visa, Card & Wallet payments gateway",
      "Performance SEO and conversion setup",
      "3 months senior support warranty",
      "Automated QA checks & security scans",
    ],
    is_popular: true,
    cta_label_ar: "ابدأ باقة النمو",
    cta_label_en: "Choose Growth Track",
  },
  {
    id: "plan-enterprise",
    name_ar: "باقة المؤسسات المخصصة",
    name_en: "Enterprise Custom",
    description_ar:
      "أنظمة برمجية مصممة خصيصاً لتلبية متطلبات الشركات الكبيرة والمؤسسات.",
    description_en:
      "Custom architecture engineered to support high enterprise demands.",
    price_monthly: null,
    price_yearly: null,
    features_ar: [
      "برمجة وبناء وتطوير مخصص بنسبة 100%",
      "إدارة وتوسيع السيرفرات السحابية DevOps",
      "فريق عمل مخصص وتطوير مستمر للمشروع",
      "دعم فني مخصص واتفاقية SLA مضمونة",
      "تحليل تسويقي شامل وخطط مضاعفة الأرباح",
    ],
    features_en: [
      "100% custom engineered software code",
      "Cloud infrastructure scaling & DevOps support",
      "Dedicated senior development squad",
      "SLA maintenance contract and 24/7 hotline",
      "Omnichannel marketing conversion audits",
    ],
    is_popular: false,
    cta_label_ar: "احجز استشارة خاصة",
    cta_label_en: "Book Custom Scoping Session",
  },
];
