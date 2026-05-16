"use client";

import { useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  disabled?: boolean;
  /** If true, suggestions appear from a fixed list */
  suggestions?: string[];
};

/**
 * Comma- and Enter-separated tag input. Useful for features, problems,
 * technologies, keywords — anything that's a list of short strings.
 */
export function TagInput({
  value,
  onChange,
  placeholder,
  dir,
  disabled,
  suggestions,
}: Props) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    onChange([...value, tag]);
    setInput("");
  }

  function removeTag(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  function onBlur() {
    if (input.trim()) addTag(input);
  }

  const filteredSuggestions = suggestions
    ?.filter((s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, i) => (
            <Badge key={`${tag}-${i}`} variant="secondary" className="pe-1 gap-1">
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(i)}
                disabled={disabled}
                className="rounded-full hover:bg-background/50 p-0.5"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          dir={dir}
          disabled={disabled}
        />
        {filteredSuggestions && filteredSuggestions.length > 0 && input.length > 0 && (
          <div className="absolute z-10 top-full mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="block w-full text-start rounded px-2 py-1 text-sm hover:bg-muted"
                dir={dir}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
