"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleServiceVisibilityAction,
  toggleServiceFeaturedAction,
} from "./actions";

type Props = {
  id: string;
  isVisible: boolean;
  isFeatured: boolean;
  locale: string;
};

export function ServiceToggleButtons({ id, isVisible, isFeatured, locale }: Props) {
  const isAr = locale === "ar";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleVisibility() {
    startTransition(async () => {
      const r = await toggleServiceVisibilityAction(id, !isVisible);
      if (!r.success) { toast.error(r.error); return; }
      toast.success(isAr ? "تم التحديث" : "Updated");
      router.refresh();
    });
  }

  function toggleFeatured() {
    startTransition(async () => {
      const r = await toggleServiceFeaturedAction(id, !isFeatured);
      if (!r.success) { toast.error(r.error); return; }
      toast.success(isAr ? "تم التحديث" : "Updated");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleVisibility}
        disabled={isPending}
        title={
          isVisible
            ? isAr ? "إخفاء الخدمة" : "Hide service"
            : isAr ? "إظهار الخدمة" : "Show service"
        }
        className={isVisible ? "" : "text-muted-foreground"}
      >
        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={toggleFeatured}
        disabled={isPending}
        title={
          isFeatured
            ? isAr ? "إلغاء التمييز" : "Unfeature"
            : isAr ? "تمييز الخدمة" : "Feature service"
        }
        className={isFeatured ? "text-amber-500" : "text-muted-foreground"}
      >
        <Star className={`h-4 w-4 ${isFeatured ? "fill-amber-500" : ""}`} />
      </Button>
    </div>
  );
}
