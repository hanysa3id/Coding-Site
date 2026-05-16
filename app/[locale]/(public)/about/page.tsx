import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ar" ? "عن الشركة" : "About" };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale === "ar";
  const tc = await getTranslations("common");

  const values = [
    {
      icon: Target,
      titleAr: "رسالتنا",
      titleEn: "Our mission",
      textAr: "تقديم خدمات برمجة وتصميم احترافية تساعد عملاءنا على تحقيق أهدافهم الرقمية.",
      textEn: "Provide professional programming and design services that help our clients reach their digital goals.",
    },
    {
      icon: Eye,
      titleAr: "رؤيتنا",
      titleEn: "Our vision",
      textAr: "أن نكون الخيار الأول للشركات والأفراد الباحثين عن جودة وموثوقية.",
      textEn: "To be the first choice for businesses and individuals seeking quality and reliability.",
    },
    {
      icon: Heart,
      titleAr: "قيمنا",
      titleEn: "Our values",
      textAr: "الالتزام بالمواعيد، الجودة في التفاصيل، الشفافية في التعامل.",
      textEn: "On-time delivery, attention to detail, and transparency in everything we do.",
    },
  ];

  return (
    <div className="container py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold">{tc("about")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          {isAr
            ? "نحن فريق متخصص في تقديم حلول البرمجة والتصميم الرقمي"
            : "We are a specialized team delivering programming and digital design solutions."}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        {values.map((v) => {
          const Icon = v.icon;
          return (
            <Card key={v.titleEn}>
              <CardContent className="pt-6 space-y-3">
                <Icon className="h-10 w-10 text-primary" />
                <h2 className="text-xl font-bold">{isAr ? v.titleAr : v.titleEn}</h2>
                <p className="text-muted-foreground">{isAr ? v.textAr : v.textEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6 prose max-w-none">
          <p className="text-lg leading-relaxed">
            {isAr
              ? "بفضل خبرة فريقنا في البرمجة والتصميم، نقدم لعملائنا حلولاً متكاملة تجمع بين الجودة التقنية والجمال البصري. نلتزم بمبدأ التواصل المستمر مع العميل في جميع مراحل المشروع لضمان تحقيق رؤيته بدقة."
              : "Drawing on our team's experience in programming and design, we deliver integrated solutions that combine technical quality with visual appeal. We commit to continuous communication with the client at every stage to ensure their vision is realized precisely."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
