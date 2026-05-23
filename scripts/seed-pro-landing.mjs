/**
 * Seed the `settings` table (key = "landing") with the Pro theme's
 * default content so that the admin CMS shows pre-populated fields.
 *
 * Usage:  node scripts/seed-pro-landing.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env manually ──────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error("⚠ Could not read .env — using existing env vars.");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ── Pro theme landing content ────────────────────────────────────────────────

const landingData = {
  // ── Section visibility ─────────────────────────────────────
  sections: {
    hero: true,
    logo_cloud: true,
    features: true,
    stats: true,
    services: true,
    process: true,
    portfolio: true,
    testimonials: true,
    pricing: true,
    team: true,
    blog: true,
    faq: true,
    newsletter: true,
    cta: true,
  },

  // ── Hero single-slide override ─────────────────────────────
  hero: {
    badge_ar: "شريكك التقني الرقمي للمستقبل",
    badge_en: "Your futuristic tech partner",
    title_ar: "نبني ونطور منصات رقمية فائقة الأداء والتوسع",
    title_en: "We Engineer High-Performance Digital Platforms",
    subtitle_ar:
      "تطوير برمجيات متكاملة، تصميم واجهات مذهلة، استضافة فائقة السرعة، وتسويق رقمي ذكي يضمن ريادتك ومضاعفة عملائك.",
    subtitle_en:
      "A high-end engineering studio designing, coding, launching, and scaling digital services with modern UI/UX and clean systems.",
    primary_cta_label_ar: "ابدأ مشروعك الآن",
    primary_cta_label_en: "Launch Your Project",
    primary_cta_href: "/contact",
    secondary_cta_label_ar: "استكشف أعمالنا",
    secondary_cta_label_en: "View Portfolio",
    secondary_cta_href: "/portfolio",
  },

  // ── Hero slides (multi-slide carousel) ─────────────────────
  hero_slides: [
    {
      badge_ar: "شريكك التقني الرقمي للمستقبل",
      badge_en: "Your futuristic tech partner",
      title_ar: "نبني ونطور منصات رقمية فائقة الأداء والتوسع",
      title_en: "We Engineer High-Performance Digital Platforms",
      subtitle_ar:
        "تطوير برمجيات متكاملة، تصميم واجهات مذهلة، استضافة فائقة السرعة، وتسويق رقمي ذكي يضمن ريادتك ومضاعفة عملائك.",
      subtitle_en:
        "A high-end engineering studio designing, coding, launching, and scaling digital services with modern UI/UX and clean systems.",
      primary_cta_label_ar: "ابدأ مشروعك الآن",
      primary_cta_label_en: "Launch Your Project",
      primary_cta_href: "/contact",
      secondary_cta_label_ar: "استكشف أعمالنا",
      secondary_cta_label_en: "View Portfolio",
      secondary_cta_href: "/portfolio",
      image_url:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=90",
      video_url: "",
    },
    {
      badge_ar: "البرمجة والتطوير السحابي",
      badge_en: "Engineering & Cloud Architectures",
      title_ar: "أطلق خدماتك الرقمية بكود نظيف وهندسة متكاملة",
      title_en: "Ship Scalable Systems With Clean Architecture",
      subtitle_ar:
        "تطوير وتصميم مواقع وتطبيقات متكاملة بأقوى التقنيات الحديثة مع فحوصات أمان شاملة ومتابعة مستمرة.",
      subtitle_en:
        "Full-scale application engineering utilizing modern stacks, comprehensive automated QA and rock-solid frameworks.",
      primary_cta_label_ar: "طلب عرض سعر",
      primary_cta_label_en: "Get Estimate",
      primary_cta_href: "/contact",
      secondary_cta_label_ar: "الخدمات",
      secondary_cta_label_en: "Services Map",
      secondary_cta_href: "/services",
      image_url:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=90",
      video_url: "",
    },
    {
      badge_ar: "التسويق ومضاعفة الأرباح",
      badge_en: "Growth & Performance Marketing",
      title_ar: "ضاعف عملاءك ومبيعاتك بخطط وحملات مدروسة",
      title_en: "Double Customer Acquisition Through Analytical Ads",
      subtitle_ar:
        "نوجه الحملات الإعلانية ونحسن محركات البحث وإدارة السوشيال ميديا بناءً على أرقام حقيقية وتقارير شفافة لتوسيع نشاطك.",
      subtitle_en:
        "Targeted digital marketing campaigns, SEO optimization, and social media funnels built to maximize ROI and scale business metrics.",
      primary_cta_label_ar: "استشر خبيراً",
      primary_cta_label_en: "Talk to Expert",
      primary_cta_href: "/contact",
      secondary_cta_label_ar: "شاهد أعمالنا",
      secondary_cta_label_en: "Case Studies",
      secondary_cta_href: "/portfolio",
      image_url:
        "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=90",
      video_url: "",
    },
    {
      badge_ar: "الاستضافة والبنية التحتية",
      badge_en: "Infrastructure & Server Monitoring",
      title_ar: "سيرفرات فائقة السرعة ودعم فني متواصل 24/7",
      title_en: "High-Availability Infrastructure With 24/7 Monitoring",
      subtitle_ar:
        "استضافات سحابية آمنة ومحمية بالكامل، مع تتبع مستمر للأخطاء ودعم فني صيانة طوال اليوم بلا انقطاع.",
      subtitle_en:
        "Ultra-fast global cloud setups, automated scaling, continuous server monitoring, and professional DevOps support round-the-clock.",
      primary_cta_label_ar: "احجز استضافتك",
      primary_cta_label_en: "Claim Server Space",
      primary_cta_href: "/contact",
      secondary_cta_label_ar: "اتصل بنا",
      secondary_cta_label_en: "Talk Support",
      secondary_cta_href: "/contact",
      image_url:
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=90",
      video_url: "",
    },
  ],

  // ── Nav defaults ───────────────────────────────────────────
  nav: {
    show_services: true,
    show_portfolio: true,
    show_blog: true,
    show_about: true,
    show_contact: true,
    custom_items: [],
  },

  // ── Logo cloud ─────────────────────────────────────────────
  logos: [
    { name: "TechPlus" },
    { name: "Nova Studio" },
    { name: "Core System" },
    { name: "Atlantis Cloud" },
    { name: "Orbit Agency" },
    { name: "Phoenix Labs" },
    { name: "Nexus Digital" },
    { name: "Stellar SaaS" },
  ],

  // ── Stats ──────────────────────────────────────────────────
  stats: [
    { value: "99.9%", label_ar: "معدل تشغيل السيرفرات", label_en: "Average Uptime Speed" },
    { value: "+240%", label_ar: "متوسط زيادة مبيعات عملائنا", label_en: "Average Client ROI Gain" },
    { value: "150+", label_ar: "منتج رقمي مكتمل", label_en: "Digital Assets Deployed" },
    { value: "24/7", label_ar: "متابعة ودعم فني", label_en: "Active Support Lane" },
  ],

  // ── FAQ ────────────────────────────────────────────────────
  faqs: [
    {
      q_ar: "ما هي الفترات الزمنية المتوقعة لتسليم المشاريع؟",
      q_en: "What are the average delivery times?",
      a_ar: "تتراوح فترات التسليم حسب حجم المتطلبات؛ صفحات الهبوط البسيطة تحتاج 7-14 يوماً، بينما الأنظمة والمنصات المعقدة قد تحتاج 4-8 أسابيع عمل.",
      a_en: "Standard landing pages take 7-14 days. Custom software applications and complex web systems require 4-8 weeks depending on specifications.",
    },
    {
      q_ar: "هل تقدمون خدمات الدعم الفني والصيانة بعد الإطلاق؟",
      q_en: "Do you offer post-launch maintenance & support?",
      a_ar: "نعم، نقدم فترة ضمان وصيانة مجانية تبدأ من شهر إلى 3 أشهر حسب الباقة المختارة، مع إمكانية توقيع عقود صيانة سنوية مخصصة.",
      a_en: "Yes, every build includes 30 to 90 days of free bug-fixing support. We also provide yearly maintenance contracts.",
    },
    {
      q_ar: "هل أحصل على ملكية الكود البرمجي للموقع بالكامل؟",
      q_en: "Do I get full ownership of the source code?",
      a_ar: "بالتأكيد، بمجرد الانتهاء من العمل وتسوية المستحقات، تنتقل ملكية الكود البرمجي وملفات المشروع بالكامل إليك مع توفير كافة الصلاحيات.",
      a_en: "Absolutely. Upon completion and final settlement, all intellectual property rights and repository access are transferred to your team.",
    },
    {
      q_ar: "كيف تضمنون أمان وحماية موقعي وبيانات عملائي؟",
      q_en: "How do you ensure data security and compliance?",
      a_ar: "نتبع أعلى بروتوكولات الأمان العالمية مثل تشفير البيانات، فحوصات الاختراق الدورية، حماية DDoS، واستخدام منصات استضافة مؤمنة للغاية.",
      a_en: "We deploy standard data encryption, conduct regular security scanning, configure server firewalls, and use top-tier cloud CDNs.",
    },
    {
      q_ar: "هل تدعمون ربط بوابات الدفع المحلية والعالمية؟",
      q_en: "Do you integrate local and global payment gateways?",
      a_ar: "نعم، ندعم تكامل جميع بوابات الدفع مثل فيزا، ماستركارد، مدى، فوري، سترايب، باي بال، وغيرها لتوفير تجربة تسوق سهلة لعملائك.",
      a_en: "Yes, we integrate with Stripe, PayPal, Authorize.net, and local regional payment processors to enable seamless card checkout pipelines.",
    },
  ],

  // ── Testimonials ───────────────────────────────────────────
  testimonials: [
    {
      id: "pro-t1",
      rating: 5,
      comment_ar:
        "تعاملنا مع فريق العمل لبناء تطبيقنا السحابي، وكانت النتيجة ممتازة من حيث الكود النظيف، السرعة الفائقة والأمان العالي. نوصي بهم بشدة.",
      comment_en:
        "Excellent engineering! They migrated our backend dashboard architecture into a robust Next.js environment. Speed increased by 3x.",
      customer_name_ar: "م. خالد عبد الرحمن",
      customer_name_en: "Khalid A. (CTO)",
      customer_role_ar: "برمجة وتطوير الأنظمة",
      customer_role_en: "Backend Engineering",
      avatar_url: "",
    },
    {
      id: "pro-t2",
      rating: 5,
      comment_ar:
        "حملات التسويق الرقمي وإعلانات السوشيال ميديا ضاعفت مبيعاتنا خلال أشهر قليلة. التقارير الأسبوعية كانت واضحة وشفافة للغاية.",
      comment_en:
        "Outstanding marketing campaigns and lead scaling strategy. Our sales targets doubled inside 3 months with transparent feedback dashboards.",
      customer_name_ar: "أ. سارة الحربي",
      customer_name_en: "Sarah H. (Product Lead)",
      customer_role_ar: "التسويق الرقمي",
      customer_role_en: "Growth Marketing",
      avatar_url: "",
    },
    {
      id: "pro-t3",
      rating: 5,
      comment_ar:
        "السيرفرات والخدمات السحابية لديهم فائقة الاستقرار والدعم الفني متواجد طوال اليوم لحل أي مشكلة فوراً. استضافة يعتمد عليها بحق.",
      comment_en:
        "Their server infrastructure setups are extremely secure. We experienced zero downtime since deploying on their edge CDN network.",
      customer_name_ar: "أ. عمر فاروق",
      customer_name_en: "Omar F. (SaaS Founder)",
      customer_role_ar: "الاستضافة والبنية التحتية",
      customer_role_en: "Cloud Hosting Support",
      avatar_url: "",
    },
    {
      id: "pro-t4",
      rating: 5,
      comment_ar:
        "السرعة الفائقة لخدمات الاستضافة ونظام إدارة المحتوى الجديد ضاعفت سرعة التصفح لدينا. فريق هندسي محترف يهتم بأدق تفاصيل الكود النظيف.",
      comment_en:
        "The engineering speed of their custom CMS setup is unbelievable. Highly optimized Next.js pages with clean code standards and solid SEO indexing.",
      customer_name_ar: "د. أحمد السالم",
      customer_name_en: "Dr. Ahmad S. (VP of Product)",
      customer_role_ar: "برمجة وتطوير المواقع",
      customer_role_en: "Web App Development",
      avatar_url: "",
    },
    {
      id: "pro-t5",
      rating: 5,
      comment_ar:
        "حققنا عائداً استثمارياً ROI يتجاوز 3x بفضل استشارات النمو وإعادة هيكلة الواجهات البرمجية. نعتبرهم شريكاً استراتيجياً حقيقياً لأعمالنا الرقمية.",
      comment_en:
        "We achieved a solid 3x ROI increase after restructuring our user funnel design. They are a true strategic partner in product growth and design.",
      customer_name_ar: "أ. ليلى القحطاني",
      customer_name_en: "Lina Q. (Marketing Director)",
      customer_role_ar: "استشارات نمو وتجربة المستخدم",
      customer_role_en: "Product Growth & UI/UX",
      avatar_url: "",
    },
    {
      id: "pro-t6",
      rating: 5,
      comment_ar:
        "البنية التحتية السحابية لديهم استثنائية. قمنا بترحيل خوادمنا بالكامل وبلا انقطاع zero downtime وبأعلى معدلات الأمان والحماية.",
      comment_en:
        "Exceptional cloud infrastructure! They migrated our microservices with zero downtime, upgrading our overall security and scaling limits.",
      customer_name_ar: "أ. يوسف علوان",
      customer_name_en: "Yousef A. (Infrastructure Lead)",
      customer_role_ar: "إدارة السيرفرات والبنية السحابية",
      customer_role_en: "DevOps & Cloud Orchestration",
      avatar_url: "",
    },
  ],

  // ── Section content overrides (pre-fill with Pro defaults) ─
  section_overrides: {
    logo_cloud: {
      title_ar: "علامات تجارية رائدة تثق بـنا",
      title_en: "brands we help launch & scale",
    },
    features: {
      title_ar: "لماذا نحن مختلفون؟",
      title_en: "Why We Stand Out",
      subtitle_ar: "المميزات",
      subtitle_en: "Features",
    },
    stats: {
      title_ar: "أرقامنا تتحدث",
      title_en: "Numbers That Speak",
    },
    services: {
      title_ar: "خدماتنا الاحترافية",
      title_en: "Our Professional Services",
      subtitle_ar: "الخدمات",
      subtitle_en: "Services",
    },
    process: {
      title_ar: "منهجيتنا في العمل",
      title_en: "Our Engineering Process",
      subtitle_ar: "كيف نعمل",
      subtitle_en: "How We Work",
    },
    portfolio: {
      title_ar: "أحدث مشاريعنا",
      title_en: "Recent Projects",
      subtitle_ar: "معرض الأعمال",
      subtitle_en: "Portfolio",
    },
    testimonials: {
      title_ar: "ماذا يقول عملاؤنا عنا",
      title_en: "What Our Clients Say",
      subtitle_ar: "آراء العملاء",
      subtitle_en: "Testimonials",
    },
    pricing: {
      title_ar: "باقات واضحة بأسعار شفافة",
      title_en: "Transparent Pricing Plans",
      subtitle_ar: "الأسعار",
      subtitle_en: "Pricing",
    },
    team: {
      title_ar: "فريق العمل",
      title_en: "Our Team",
      subtitle_ar: "من نحن",
      subtitle_en: "About Us",
    },
    blog: {
      title_ar: "آخر المقالات والأخبار",
      title_en: "Latest Blog Posts",
      subtitle_ar: "المدونة",
      subtitle_en: "Blog",
    },
    faq: {
      title_ar: "لديك أسئلة؟ نحن نوفر لك الإجابات",
      title_en: "Everything You Need to Get Started",
      subtitle_ar: "الأسئلة الشائعة",
      subtitle_en: "Common Inquiries",
    },
    newsletter: {
      title_ar: "اشترك في نشرتنا الأسبوعية",
      title_en: "Subscribe to Our Newsletter",
      subtitle_ar: "النشرة البريدية",
      subtitle_en: "Newsletter",
    },
    cta: {
      title_ar: "جاهز لتحويل أفكارك إلى واقع رقمي؟",
      title_en: "Ready to Transform Your Ideas Into Reality?",
      subtitle_ar: "ابدأ الآن",
      subtitle_en: "Get Started",
    },
  },

  // ── Dictionary overrides (empty — user fills as needed) ────
  dictionary_overrides_ar: {},
  dictionary_overrides_en: {},
};

// ── Upsert into Supabase ─────────────────────────────────────────────────────

async function main() {
  console.log("🔧 Seeding Pro theme landing content into settings table…");

  const { error } = await supabase
    .from("settings")
    .upsert(
      { key: "landing", value: landingData },
      { onConflict: "key" }
    );

  if (error) {
    console.error("❌ Failed to seed:", error.message);
    process.exit(1);
  }

  console.log("✅ Landing content seeded successfully!");
  console.log("   → Hero: 4 slides with full AR/EN content");
  console.log("   → Logos: 8 brand names");
  console.log("   → Stats: 4 entries");
  console.log("   → FAQ: 5 questions");
  console.log("   → Testimonials: 6 reviews");
  console.log("   → Section overrides: 12 sections with titles");
  console.log("\n📌 Refresh /admin/landing to see all pre-filled content.");
}

main();
