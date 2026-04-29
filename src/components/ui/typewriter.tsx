"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  color?: string;
}

export function Typewriter({
  text,
  speed = 80,
  deleteSpeed = 45,
  pauseAfterType = 1800,
  pauseAfterDelete = 500,
  color = "#09b850",
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = (current: string, isTyping: boolean) => {
      if (isTyping) {
        if (current.length < text.length) {
          const next = text.slice(0, current.length + 1);
          timeout = setTimeout(() => {
            setDisplayed(next);
            tick(next, true);
          }, speed);
        } else {
          timeout = setTimeout(() => {
            setTyping(false);
            tick(current, false);
          }, pauseAfterType);
        }
      } else {
        if (current.length > 0) {
          const next = current.slice(0, -1);
          timeout = setTimeout(() => {
            setDisplayed(next);
            tick(next, false);
          }, deleteSpeed);
        } else {
          timeout = setTimeout(() => {
            setTyping(true);
            tick("", true);
          }, pauseAfterDelete);
        }
      }
    };

    timeout = setTimeout(() => tick("", true), 400);
    return () => clearTimeout(timeout);
  }, [text, speed, deleteSpeed, pauseAfterType, pauseAfterDelete]);

  return (
    <span className="relative inline-block">
      <span style={{ color }}>{displayed}</span>
      <span
        className="inline-block w-[3px] h-[0.85em] ml-0.5 align-middle rounded-sm animate-pulse"
        style={{ backgroundColor: color }}
      />
      <span
        className="absolute -bottom-1 left-0 h-1 rounded-full opacity-30 transition-all duration-100"
        style={{ backgroundColor: color, width: displayed.length > 0 ? "100%" : "0%" }}
      />
    </span>
  );
}
