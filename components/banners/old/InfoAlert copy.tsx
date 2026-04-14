// InfoAlert.tsx
'use client';
import { useEffect, useState } from "react";

interface InfoAlertProps {
  message?: string | null;
  duration?: number; // milliseconds
}

export default function InfoAlert({ message, duration }: InfoAlertProps) {
  const [visible, setVisible] = useState(!!message);
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setShow(true);
    setVisible(true);

    if (duration) {
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  // When opacity animation ends, remove from DOM
  const handleTransitionEnd = () => {
    if (!visible) setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={`overflow-hidden transition-all duration-350 ${
        visible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      } bg-blue-100 border border-blue-400 text-blue-700 rounded-md p-3 mb-2`}
      onTransitionEnd={handleTransitionEnd}
    >
      <span className="mr-2 text-blue-500">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
