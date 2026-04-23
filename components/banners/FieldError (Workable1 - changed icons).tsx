"use client";

import { ReactNode } from "react";

interface FieldErrorProps {
  message?: string | ReactNode | null;
  className?: string;
}

export default function FieldError({
  message,
  className = "",
}: FieldErrorProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={`flex items-center text-sm text-red-700 bg-red-50 border border-red-700 rounded-md p-2 ${className}`}
    >
      <span className="mr-2 text-red-500">⚠</span>
      <span>{message}</span>
    </p>
  );
}