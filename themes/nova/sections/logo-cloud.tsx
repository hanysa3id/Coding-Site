import { NovaSection } from "../ui/section";

const DEFAULT_BRANDS = [
  "Northwind",
  "Acme",
  "Helios",
  "Vertex",
  "Lumen",
  "Atlas",
  "Quanta",
  "Orbit",
  "Stratus",
  "Polaris",
  "Cipher",
  "Sigma",
];

export function NovaLogoCloud({
  locale,
  brands = DEFAULT_BRANDS,
}: {
  locale: string;
  brands?: string[];
}) {
  const isAr = locale === "ar";
  const doubled = [...brands, ...brands];

  return (
    <NovaSection size="md">
      <p className="text-center text-sm md:text-base text-white/55 mb-10">
        {isAr ? "علامات تعتمد علينا في بناء منتجاتها" : "Brands count on us to build their products"}
      </p>
      <div className="nova-marquee-mask overflow-hidden">
        <div className="nova-marquee gap-12 items-center">
          {doubled.map((b, i) => (
            <span
              key={i}
              className="text-base md:text-lg nova-mono text-white/35 hover:text-white/70 transition-colors whitespace-nowrap select-none"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </NovaSection>
  );
}
