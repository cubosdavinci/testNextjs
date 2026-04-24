"use client";

import { ReactNode } from "react";

interface FieldErrorProps {
  message?: string | ReactNode | null;
  className?: string;
  iconSize?: number; // NEW
}

export default function FieldError({
  message,
  className = "",
  iconSize = 32,
}: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`flex items-center text-red-700 bg-red-100 border border-red-700 rounded-md p-2 ${className}`}
    >
      <img
        src="/icons/ui/streamline-ultimate-color:delete-2.svg"
        alt="error"
        className="mr-2"
        style={{ width: iconSize, height: iconSize }}
      />

      <span>{message}</span>
    </p>
  );
}