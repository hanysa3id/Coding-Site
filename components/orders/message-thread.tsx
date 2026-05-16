"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Shield } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";

type Sender = {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
} | null;

export type ThreadMessage = {
  id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  created_at: string;
  sender: Sender;
};

type Props = {
  orderId: string;
  currentUserId: string;
  messages: ThreadMessage[];
  locale: string;
  sendAction: (input: {
    order_id: string;
    content: string;
  }) => Promise<{ success: true } | { success: false; error: string }>;
};

export function MessageThread({
  orderId,
  currentUserId,
  messages,
  locale,
  sendAction,
}: Props) {
  const isAr = locale === "ar";
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function onSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await sendAction({ order_id: orderId, content: trimmed });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setContent("");
    });
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {isAr ? "ابدأ المحادثة بإرسال رسالتك الأولى" : "Start the conversation by sending your first message"}
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === currentUserId;
            const isStaff = m.sender?.role && m.sender.role !== "customer";
            const initials = (m.sender?.full_name ?? "?")
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div
                key={m.id}
                className={cn("flex gap-3", isMine && "flex-row-reverse")}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={isStaff ? "bg-primary text-primary-foreground" : ""}>
                    {isStaff ? <Shield className="h-4 w-4" /> : initials}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[75%] space-y-1", isMine && "items-end")}>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    )}
                  >
                    {m.content}
                  </div>
                  <div className={cn("text-xs text-muted-foreground", isMine && "text-end")}>
                    {m.sender?.full_name ?? "—"} ·{" "}
                    {formatDateTime(m.created_at, isAr ? "ar-EG" : "en-US")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="flex gap-2 p-3 border-t bg-background">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isAr ? "اكتب رسالتك..." : "Type your message..."}
          rows={2}
          disabled={isPending}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isPending || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
