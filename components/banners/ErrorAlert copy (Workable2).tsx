"use client";

import { useState, useEffect, useCallback } from "react";

type ErrorAlertProps = {
  message: string | null;
  onClose: () => void;         // Required: Parent controls what happens on close
  dismiss?: boolean;           // Default: false (no auto-dismiss)
  duration?: number;           // Only used when dismiss = true
  fadeTime?: number;           // Animation duration (default 500ms)
};

export default function ErrorAlert({
  message,
  onClose,
  dismiss = false,
  duration = 4000,
  fadeTime = 500,
}: ErrorAlertProps) {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const triggerExit = useCallback(() => {
    setIsExiting(true);

    // After animation finishes → call parent's onClose
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, fadeTime);
  }, [fadeTime, onClose]);

  // Auto-dismiss logic
  useEffect(() => {
    if (!dismiss || !message) return;

    const timer = setTimeout(() => {
      triggerExit();
    }, duration);

    return () => clearTimeout(timer);
  }, [dismiss, duration, message, triggerExit]);

  const handleClose = () => {
    triggerExit();
  };

  if (!message || !visible) return null;

  return (
    <div
      className={`relative p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 overflow-hidden transition-all ease-out
        ${isExiting 
          ? "opacity-0 max-h-0 py-0 my-0" 
          : "opacity-100 max-h-[200px]"
        }`}
      style={{ transitionDuration: `${fadeTime}ms` }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-2xl leading-none font-light transition-colors"
        aria-label="Close error"
      >
        ×
      </button>

      {/* Error message */}
      <div className="pr-8">
        {message}
      </div>
    </div>
  );
}