"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileAttachmentsInput } from "@/components/orders/file-attachments-input";
import { VoiceRecorder } from "@/components/orders/voice-recorder";
import { Paperclip, Mic, MessageSquare } from "lucide-react";
import { createOrderAction } from "../actions";

export function NewOrderForm({
  serviceId,
  customerName,
  customerWhatsapp,
  locale,
}: {
  serviceId: string;
  customerName: string;
  customerWhatsapp: string;
  locale: string;
}) {
  const isAr = locale === "ar";
  const tc = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [voice, setVoice] = useState<Blob | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (message.trim().length < 10) {
      setError(isAr ? "اكتب على الأقل 10 أحرف في رسالتك" : "Please write at least 10 characters");
      return;
    }

    const fd = new FormData();
    fd.append("service_id", serviceId);
    fd.append("customer_message", message.trim());
    for (const f of files) fd.append("files", f);
    if (voice) {
      const ext = guessAudioExt(voice.type);
      const filename = `voice-note-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      fd.append("voice", new File([voice], filename, { type: voice.type }));
    }

    startTransition(async () => {
      const result = await createOrderAction(fd);
      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(isAr ? `تم إنشاء طلب ${result.orderNumber}` : `Order ${result.orderNumber} created`);
      router.push(`/orders/${result.orderId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-2">
        <Label htmlFor="customer_message" className="inline-flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="h-4 w-4" />
          {isAr ? "رسالتك ومتطلباتك" : "Your message and requirements"}
        </Label>
        <Textarea
          id="customer_message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={
            isAr
              ? "اشرح متطلباتك بالتفصيل... أهداف المشروع، الميزات المطلوبة، الموعد المفضل، أي ملاحظات."
              : "Describe your requirements in detail... project goals, features, preferred timeline, any notes."
          }
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          {isAr
            ? `سنتواصل معك على رقم: ${customerWhatsapp || "—"}`
            : `We'll contact you on: ${customerWhatsapp || "—"}`}
        </p>
      </section>

      <section className="space-y-2">
        <Label className="inline-flex items-center gap-2 text-base font-semibold">
          <Paperclip className="h-4 w-4" />
          {isAr ? "مرفقات الطلب (اختياري)" : "Attachments (optional)"}
        </Label>
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "ارفق ملفات مرجعية: brief، مخططات، صور، مستندات سابقة، إلخ"
            : "Attach reference files: briefs, mockups, images, prior documents, etc."}
        </p>
        <FileAttachmentsInput
          value={files}
          onChange={setFiles}
          locale={locale}
          disabled={isPending}
        />
      </section>

      <section className="space-y-2">
        <Label className="inline-flex items-center gap-2 text-base font-semibold">
          <Mic className="h-4 w-4" />
          {isAr ? "ملاحظة صوتية (اختياري)" : "Voice note (optional)"}
        </Label>
        <p className="text-xs text-muted-foreground">
          {isAr
            ? "أحياناً يكون شرح المتطلبات بالصوت أوضح من الكتابة. سجّل ملاحظة صوتية حتى ٥ دقائق."
            : "Sometimes it's easier to explain by voice. Record up to 5 minutes."}
        </p>
        <VoiceRecorder value={voice} onChange={setVoice} locale={locale} disabled={isPending} />
      </section>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isPending}>
          {tc("cancel")}
        </Button>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (isAr ? "جارٍ الإرسال..." : "Submitting...") : isAr ? "إرسال الطلب" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}

function guessAudioExt(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "m4a";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mp3") || mime.includes("mpeg")) return "mp3";
  return "webm";
}
