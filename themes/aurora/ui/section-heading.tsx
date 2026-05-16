import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";
import { H2, Lead } from "./typography";

// Consistent section header. kicker = mono label, title = H2, description = lead.
// Always use this — never compose a section header by hand.
export function SectionHeading({
  kicker,
  title,
  description,
  align = "start",
  className,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl space-y-4",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {kicker && <Eyebrow>{kicker}</Eyebrow>}
      <H2>{title}</H2>
      {description && <Lead>{description}</Lead>}
    </div>
  );
}
