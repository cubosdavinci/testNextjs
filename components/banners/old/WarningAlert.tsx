'use client';

interface WarningAlertProps {
  message?: string | null;
  className?: string;
}

/**
 * Displays a yellow/orange warning banner with a warning icon.
 * Example: <WarningAlert message={warning} />
 */
export default function WarningAlert({ message, className = "" }: WarningAlertProps) {
  if (!message) return null;

  return (
    <div className={`
      p-3 
      bg-yellow-100 
      border 
      border-yellow-300 
      text-yellow-800 
      rounded-md 
      flex 
      items-center
      ${className}
    `}>
      <span className="mr-2 text-yellow-600">⚠️</span>
      <span>{message}</span>
    </div>
  );
}
