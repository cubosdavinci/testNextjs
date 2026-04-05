"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/styles/buttonClasses";
import { secondaryProviders, SecondaryProvider } from "@/types/auth/signin-providers";
import { Loader2 } from "lucide-react";
import { cardClasses } from "@/styles/cardClasses";

export default function Card_LoginWithLinkedProviders() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("loginWithLinkedErrors");
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam) setError(errorParam);
  }, [errorParam]);

  const handleSignIn = (providerId: string) => {
    setError(null);
    setLoadingProvider(providerId);
    signIn(providerId);
  };

  return (
    <Card className={`${cardClasses.primary}`}>
      <CardHeader className="text-center">
        <CardTitle>Sign-in with linked providers</CardTitle>
        {error && <div className={`${cardClasses.error}`}>{error}</div>}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap justify-center gap-6">
        {secondaryProviders.map((provider: SecondaryProvider) => {
        const { id, name, svg } = provider;
  return (
    <div key={id} className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleSignIn(id)}
        type="button"
        disabled={!!loadingProvider}
        className={`${buttonClasses.primary} flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loadingProvider === id ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
           <img src={svg} alt={name} className="mx-2 w-6 h-6" />
        )}
      </button>
      <span className="text-sm text-gray-600">{provider.name}</span>
    </div>
  );
})}
        </div>
      </CardContent>
    </Card>
  );
}
