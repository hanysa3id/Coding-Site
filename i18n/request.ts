import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getLandingSettings } from "@/lib/settings/get";

function deepMerge(target: any, source: any) {
  if (!source) return target;
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  // Load default JSON messages
  const defaultMessages = (await import(`./messages/${locale}.json`)).default;

  // Fetch overrides from settings
  let finalMessages = { ...defaultMessages };
  try {
    const landing = await getLandingSettings();
    if (landing) {
      const overrides = locale === "ar" ? landing.dictionary_overrides_ar : landing.dictionary_overrides_en;
      if (overrides && Object.keys(overrides).length > 0) {
        finalMessages = deepMerge(finalMessages, overrides);
      }
    }
  } catch (error) {
    console.error("Failed to fetch dictionary overrides:", error);
  }

  return {
    locale,
    messages: finalMessages,
  };
});
