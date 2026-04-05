"use client";

import React, { useState, useEffect, JSX } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/styles/buttonClasses";
import { Loader2 } from "lucide-react";
import { cardClasses } from "@/styles/cardClasses";

interface Provider {
  name: string;
  id: string;
  svg: JSX.Element;
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
      svg: (
        <svg className="mx-2" width="24" height="24" viewBox="0 0 533.5 544.3">
          <path
            d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95.1h146.9c-6.3 33.7-25.1 62.2-53.5 81.3l86.4 67c50.5-46.6 81.7-115.1 81.7-193.2z"
            fill="#4285f4"
          />
          <path
            d="M272 544.3c72.9 0 134.1-24.1 178.8-65.2l-86.4-67c-24 16.1-54.8 25.6-92.4 25.6-71 0-131.1-47.9-152.7-112.1l-89.9 69.2c43.5 86.1 132.6 149.5 242.6 149.5z"
            fill="#34a853"
          />
          <path
            d="M119.3 325.6c-10.2-30.2-10.2-62.7 0-92.9L29.4 163.5C10.5 201.3 0 245 0 289.7c0 44.7 10.5 88.4 29.4 126.2l89.9-69.2z"
            fill="#fbbc05"
          />
          <path
            d="M272 107.7c39.7 0 75.5 13.7 103.7 40.7l77.7-77.7C406.1 24.2 344.9 0 272 0 162 0 72.9 63.4 29.4 149.5l89.9 69.2c21.6-64.2 81.7-111 152.7-111z"
            fill="#ea4335"
          />
        </svg>
      ),

    },
  ];

  const handleSignIn = (providerId: string) => {
    setError(null);
    setLoadingProvider(providerId);
    signIn(providerId);
  };

  return (
    <Card className={`${cardClasses.primary}`}>
      <CardHeader className="text-center">
        <CardTitle>Sign-in or Sign-up with Google</CardTitle>
        {error && (
          <div className={`${cardClasses.error}`}>{error}</div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="flex flex-col items-center gap-1">
              <button
                onClick={() => handleSignIn(provider.id)}
                type="button"
                disabled={!!loadingProvider}
                className={`${buttonClasses.primary} flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingProvider === provider.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  provider.svg
                )}
              </button>
              <span className="text-sm text-gray-600">{provider.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
