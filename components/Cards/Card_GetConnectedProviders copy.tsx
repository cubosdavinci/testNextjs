"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/styles/buttonClasses";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { secondaryProviders, SecondaryProvider } from "@/types/auth/signin-providers";

export default function Card_GetConnectedProviders() {
  const [connectedProviders, setconnectedProviders] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const fetchconnectedProviders = async () => {
    setLoadingProviders(true);
    setError(null);

    try {
      const res = await fetch("/api/connect_accounts/get-providers");
      const json = await res.json();

      if (json.error) {
        setError(json.error);
        setconnectedProviders(null); // do not generate buttons
      } else {
        setconnectedProviders(json.connectedProviders || []);
      }
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "The list of providers couldn't be fetched, try later.");
      setconnectedProviders(null);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchconnectedProviders();
  }, []);

  const handleLinkUnlink = (providerId: string) => {
    console.log("Toggle link/unlink for", providerId);
    setLoadingButton(providerId);
    setTimeout(() => setLoadingButton(null), 1000); // simulate async
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Connected Providers</CardTitle>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {loadingProviders ? (
          <div className="text-center">Loading providers...</div>
        ) : connectedProviders === null ? (
          <button
            onClick={fetchconnectedProviders}
            className="mt-4 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            Get Connected Providers
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {secondaryProviders.map((provider: SecondaryProvider) => {
              const { id, name, svg: ProviderIcon } = provider;
              const isConnected = connectedProviders.includes(id);
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleLinkUnlink(id)}
                    disabled={!!loadingButton}
                    className={clsx(
                      buttonClasses.primary,
                      "flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                      isConnected ? "bg-green-700 hover:bg-green-400" : "bg-gray-300 hover:bg-green-400"
                    )}
                  >
                    {loadingButton === id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ProviderIcon className="mx-2 w-6 h-6" />
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    {isConnected ? `Diconnect ${name}` : `Connect ${name}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
