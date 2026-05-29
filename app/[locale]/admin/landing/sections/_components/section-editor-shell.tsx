"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveLandingSettingsAction } from "../../../settings/actions";
import type { LandingSettings } from "@/lib/validators/settings";
import { cn } from "@/lib/utils";

interface SectionEditorShellProps {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  locale: string;
  data: LandingSettings;
  setData: (data: LandingSettings) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onReset?: () => void;
  isDirty?: boolean;
}

export function SectionEditorShell({
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  locale,
  data,
  setData,
  children,
  icon,
  onReset,
  isDirty = false,
}: SectionEditorShellProps) {
  const isAr = locale === "ar";
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSave() {
    startTransition(async () => {
      const result = await saveLandingSettingsAction(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="-ms-2">
              <Link href={`/${locale}/admin/landing/sections`}>
                {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Link>
            </Button>
            {icon && <div className="text-primary bg-primary/10 p-1.5 rounded-md">{icon}</div>}
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {isAr ? titleAr : titleEn}
              {isDirty && (
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" title={isAr ? "تغييرات غير محفوظة" : "Unsaved changes"} />
              )}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ms-10">
            {isAr ? descriptionAr : descriptionEn}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <Button 
              variant="outline" 
              onClick={onReset} 
              disabled={isPending || !isDirty}
              className={cn(isDirty && "border-amber-500/50 text-amber-500 hover:text-amber-600 hover:bg-amber-50")}
            >
              {isAr ? "إلغاء التغييرات" : "Discard Changes"}
            </Button>
          )}
          <Button onClick={onSave} disabled={isPending || !isDirty}>
            <Save className="h-4 w-4 mr-2" />
            {isAr ? "حفظ التعديلات" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
