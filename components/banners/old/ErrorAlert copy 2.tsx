import React, { useState } from 'react';

interface ErrorAlertProps {
  message: string | null;
  onClose: () => void;
  duration?: number; // Duration in ms for exit animation
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onClose,
  duration = 300
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Trigger exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, duration); // Delay actual state clear until animation finishes
  };

  if (!message) return null;

  return (
    <div
      className={`overflow-hidden transition-all ease-in-out ${isExiting ? 'opacity-0 max-h-0 py-0 border-0' : 'opacity-100 max-h-40 py-4 border'
        }`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      <div className="relative p-4 bg-red-50 border border-red-200 rounded text-red-700">
        <button
          onClick={handleClose}                    // ← Fixed: was using undefined clearError
          className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-2xl leading-none font-light"
          aria-label="Close"
        >
          ×
        </button>
        {message}
      </div>
    </div>
  );
};

export default ErrorAlert;