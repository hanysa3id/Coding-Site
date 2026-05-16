"use client";

import { useEffect, useState } from "react";

// Type-writer that cycles through an array of words/phrases. Used in
// the Sky hero to draw attention to the headline.
export function Typewriter({
  words,
  speed = 70,
  pause = 1400,
  className,
}: {
  words: string[];
  speed?: number;
  pause?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "erase">("type");

  useEffect(() => {
    const current = words[idx % words.length];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "type") {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), speed);
      } else {
        timer = setTimeout(() => setPhase("hold"), pause);
      }
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("erase"), pause);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), speed / 2);
      } else {
        setIdx((i) => i + 1);
        setPhase("type");
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, idx, words, speed, pause]);

  return (
    <span className={className}>
      {text}
      <span className="sky-cursor" aria-hidden />
    </span>
  );
}
