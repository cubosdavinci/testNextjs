"use client";

import { useEffect, useState } from "react";

interface FieldInfoProps {
  message?: string | null;
  duration?: number;
  className?: string;
  iconSize?: number; // NEW (default 32)
}

export default function FieldInfo({
  message,
  duration,
  className = "",
  iconSize = 32,
}: FieldInfoProps) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (!message) return;

    if (duration && duration > 0) {
      const timer = setTimeout(() => setFade(true), duration);
      const removeTimer = setTimeout(() => setVisible(false), duration + 350);

      return () => {
        clearTimeout(timer);
        clearTimeout(removeTimer);
      };
    }
  }, [message, duration]);

  if (!message || !visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-3 bg-green-100 border border-green-700 text-green-700 rounded-md flex items-center transition-opacity duration-300 ${fade ? "opacity-0" : "opacity-100"
        } ${className}`}
    >
      <img
        src="/icons/ui/streamline-ultimate-color:check.svg"
        alt="success"
        className="mr-2"
        style={{ width: iconSize, height: iconSize }}
      />

      <span>{message}</span>
    </div>
  );
}