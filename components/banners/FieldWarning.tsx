"use client";

interface FieldWarningProps {
  message?: string | null;
  className?: string;
  iconSize?: number; // NEW
}

/**
 * Displays a yellow/orange warning banner with a warning icon.
 */
export default function FieldWarning({
  message,
  className = "",
  iconSize = 32,
}: FieldWarningProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`p-3 bg-yellow-100 border border-yellow-800 text-yellow-800 rounded-md flex items-center ${className}`}
    >
      <img
        src="/icons/ui/streamline-ultimate-color:pencil-1.svg"
        alt="warning"
        className="mr-2"
        style={{ width: iconSize, height: iconSize }}
      />

      <span>{message}</span>
    </div>
  );
}