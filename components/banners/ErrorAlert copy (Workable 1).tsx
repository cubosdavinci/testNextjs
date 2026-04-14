"use client";

import { useEffect } from "react";

type ErrorAlertProps = {
  message: string | null;
  onClose: () => void;
  autoDismiss?: boolean;
  duration?: number;
};

export default function ErrorAlert({
  message,
  onClose,
  autoDismiss = false,
  duration = 4000,
}: ErrorAlertProps) {
  useEffect(() => {
    if (!autoDismiss || !message) return;         //animate-fade-in   

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoDismiss, duration, message, onClose]);

  if (!message) return null;

return (
  <div className="relative p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 ">
    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-2xl leading-none font-light " 
      aria-label="Close"
    >
      ×
    </button>

    {/* Error text */}
    <div className="pr-6">
      {message}
    </div>
  </div>
);
}