import { getActiveTheme } from "@/themes";

// Public homepage delegates to the active theme — see themes/index.ts.
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { HomePage: ThemeHomePage } = await getActiveTheme();
  return <ThemeHomePage params={params} />;
}
