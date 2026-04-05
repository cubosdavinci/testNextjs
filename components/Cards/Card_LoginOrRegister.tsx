"use client";

import React, { useState, useEffect, JSX } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

interface Provider {
  name: string;
  id: string;
  image: string;
}

export default function Card_LoginOrRegister() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("loginOrRegisterErrors");
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) {
      setError(errorParam);
    }
  }, [errorParam]);

  const providers: Provider[] = [
    {
      name: "Google",
      id: "google",
      image: "/images/login/google-beige.jpg", // 👈 local image
    },
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
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleSignIn(provider.id)}
            type="button"
            disabled={!!loadingProvider}
            className="flex flex-col items-center border p-2 rounded shadow hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingProvider === provider.id ? (
              <Loader2 className="h-10 w-10 animate-spin mb-2" />
            ) : (
              <img
                src={provider.image}
                alt={provider.name}
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}
            <span className="text-center font-medium">
              <em>Sign-in</em> or <em>Sign-up</em>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
