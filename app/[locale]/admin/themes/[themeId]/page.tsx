import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { themes, type ThemeId } from "@/themes";
import {
  themeCustomizationSchema,
  type ThemeCustomization,
} from "@/lib/validators/theme-builder";
import { landingSectionIdSchema } from "@/lib/validators/settings";
import { getThemeCustomizationsRaw, getThemeSettings } from "@/lib/settings/get";
import { ThemeBuilderForm } from "./_components/theme-builder";

export const dynamic = "force-dynamic";

const SECTION_IDS = landingSectionIdSchema.options;

function defaultCustomization(themeId: ThemeId): ThemeCustomization {
  return themeCustomizationSchema.parse({
    base_theme: themeId,
    display_name: `${themes[themeId].config.name} (custom)`,
    sections: SECTION_IDS.map((id) => ({
      id,
      visible: true,
      animation: "fade-up" as const,
      duration_ms: 700,
      stagger_ms: 60,
    })),
  });
}

export default async function ThemeBuilderPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const locale = await getLocale();
  const { themeId } = await params;

  if (!(themeId in themes)) notFound();
  const id = themeId as ThemeId;

  const [bag, active] = await Promise.all([
    getThemeCustomizationsRaw(),
    getThemeSettings(),
  ]);
  const existing = (bag as Record<string, unknown> | null)?.[id];
  const parsed = existing
    ? themeCustomizationSchema.safeParse(existing)
    : null;
  let initial: ThemeCustomization = parsed?.success
    ? parsed.data
    : defaultCustomization(id);

  // Ensure every canonical section id is present, in the saved order.
  const presentIds = new Set(initial.sections.map((s) => s.id));
  const merged = [
    ...initial.sections.filter((s) => SECTION_IDS.includes(s.id as never)),
    ...SECTION_IDS.filter((sid) => !presentIds.has(sid)).map((sid) => ({
      id: sid,
      visible: true,
      animation: "fade-up" as const,
      duration_ms: 700,
      stagger_ms: 60,
    })),
  ];
  initial = { ...initial, sections: merged };

  return (
    <ThemeBuilderForm
      themeId={id}
      themeName={themes[id].config.name}
      themeDescription={themes[id].config.description}
      locale={locale}
      initial={initial}
      isActive={(active?.active ?? "classic") === id}
    />
  );
}
