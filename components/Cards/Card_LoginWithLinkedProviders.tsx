"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginWithLinkedProviders() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("loginWithLinkedErrors");
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) setError(errorParam);
  }, [errorParam]);

  const providers = [
    { id: "apple", name: "Apple", image: "/images/login/apple-beige.jpg" },
    { id: "facebook", name: "Facebook", image: "/images/login/facebook-beige.jpg" },
    { id: "twitter", name: "X", image: "/images/login/x-beige.jpg" },
    { id: "onshape", name: "Onshape", image: "/images/login/onshape-beige.jpg" },
  ];

  const handleSignIn = (providerId: string) => {
    setError(null);
    setLoadingProvider(providerId);
    signIn(providerId);
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <p className="mb-4 text-red-500 font-medium text-center">{error}</p>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {providers.map(({ id, name, image }) => (
          <button
            key={id}
            onClick={() => handleSignIn(id)}
            type="button"
            disabled={!!loadingProvider}
            className="flex flex-col items-center border p-2 rounded shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === id ? (
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
            ) : (
              <img
                src={image}
                alt={name}
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}
            <span className="text-center font-medium"><em>Sign-in</em></span>
          </button>
        ))}
      </div>
    </div>
  );
}
