'use client';

import { ReactNode } from "react";

interface ErrorAlertProps {
  message?: string | ReactNode | null;
  className?: string;
}

/**
 * Displays a red error banner with a yellow warning triangle.
 * Example: <ErrorAlert message={error} />
 */
export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className={`p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center ${className}`}>
      <span className="mr-2 text-yellow-500">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
