"use client";

import { useState, useEffect, useCallback } from "react";

type ErrorAlertProps = {
  message: string | null;
  onClose?: () => void;
  dismiss?: boolean;
  duration?: number;
  fadeTime?: number;
};

export default function ErrorAlert({
  message,
  onClose,
  dismiss = false,
  duration = 4000,
  fadeTime = 500,
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Reset visibility when message changes
  useEffect(() => {
    if (message) {
      setIsExiting(false);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [message]);

  const triggerExit = useCallback(() => {
    setIsExiting(true);

    // Delay the actual hiding + onClose until animation finishes
    const timeout = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, fadeTime);

    return () => clearTimeout(timeout);
  }, [fadeTime, onClose]);

  // Auto-dismiss
  useEffect(() => {
    if (!dismiss || !message || !isVisible) return;

    const timer = setTimeout(() => {
      triggerExit();
    }, duration);

    return () => clearTimeout(timer);
  }, [dismiss, duration, message, isVisible, triggerExit]);

  const handleClose = () => {
    triggerExit();
  };

  if (!message || !isVisible) return null;

  return (
    <div
      className={`relative p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 overflow-hidden transition-all ease-out
        ${isExiting
          ? "opacity-0 max-h-0 py-0 my-0"
          : "opacity-100 max-h-[200px]"
        }`}
      style={{ transitionDuration: `${fadeTime}ms` }}
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-2xl leading-none font-light transition-colors"
        aria-label="Close error"
      >
        ×
      </button>

      <div className="pr-8">{message}</div>
    </div>
  );
}