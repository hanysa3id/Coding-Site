import { getLocale } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles } from "lucide-react";
import { themes, type ThemeId } from "@/themes";
import { getThemeSettings, getThemeCustomizationsRaw } from "@/lib/settings/get";
import { ThemeCardActions } from "./_components/theme-card-actions";

export const dynamic = "force-dynamic";

export default async function ThemesIndexPage() {
  const locale = await getLocale();
  const isAr = locale === "ar";
  const [active, bag] = await Promise.all([
    getThemeSettings(),
    getThemeCustomizationsRaw(),
  ]);
  const activeId = (active?.active ?? "classic") as ThemeId;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            {isAr ? "الثيمات" : "Themes"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {isAr
              ? "اختر ثيم أساسي وخصّصه عبر Theme Builder — ألوان، خطوط، انحناءات، حركات، أصوات."
              : "Pick a base theme and customize it through the Theme Builder — colors, fonts, shape, motion, sounds."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(themes) as ThemeId[]).map((id) => {
          const t = themes[id];
          const customized = !!(bag as Record<string, unknown> | null)?.[id];
          const isActive = id === activeId;
          return (
            <Card key={id} className="relative overflow-hidden group hover:shadow-lg transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold capitalize">
                    {t.config.name}
                  </h2>
                  <div className="flex items-center gap-1">
                    {customized && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Sparkles className="h-3 w-3" />
                        {isAr ? "مخصّص" : "Customized"}
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="text-[10px]">
                        {isAr ? "مفعّل" : "Live"}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {t.config.description}
                </p>
                <ThemeCardActions
                  themeId={id}
                  themeName={t.config.name}
                  customized={customized}
                  isActive={isActive}
                  locale={locale}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
