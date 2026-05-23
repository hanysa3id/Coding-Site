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

interface SectionEditorShellProps {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  locale: string;
  data: LandingSettings;
  setData: (data: LandingSettings) => void;
  children: React.ReactNode;
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
            <h1 className="text-2xl font-bold tracking-tight">{isAr ? titleAr : titleEn}</h1>
          </div>
          <p className="text-sm text-muted-foreground ms-10">
            {isAr ? descriptionAr : descriptionEn}
          </p>
        </div>
        <Button onClick={onSave} disabled={isPending}>
          <Save className="h-4 w-4 mr-2" />
          {isAr ? "حفظ التعديلات" : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
