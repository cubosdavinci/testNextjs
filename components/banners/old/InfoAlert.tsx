'use client';

import { useEffect, useState } from "react";

interface InfoAlertProps {
  message?: string | null;
  duration?: number; // milliseconds
  className?: string;
}

export default function InfoAlert({ message, duration, className = "" }: InfoAlertProps) {
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
      className={`p-3 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'} ${className}`}
    >
      <span className="mr-2 text-green-500">✅</span>
      <span>{message}</span>
    </div>
  );
}
