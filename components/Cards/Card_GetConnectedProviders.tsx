"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClasses } from "@/styles/buttonClasses";
import { Loader2 } from "lucide-react";
import clsx from "clsx";
import { secondaryProviders, SecondaryProvider } from "@/types/auth/signin-providers";
import { cardClasses } from "@/styles/cardClasses";

export default function Card_GetConnectedProviders() {
  const [connectedProviders, setConnectedProviders] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  // fetch initial connected providers
  const fetchConnectedProviders = async () => {
    setLoadingProviders(true);
    setError(null);

    try {
      const res = await fetch("/api/accounts/get-providers");
      const json = await res.json();

      if (json.error) {
        setError(json.error);
        setConnectedProviders(null); // do not generate buttons
      } else {
        setConnectedProviders(json.connectedProviders || []);
      }
    } catch (e) {
      console.error(e);
      setError((e as Error).message || "The list of providers couldn't be fetched, try later.");
      setConnectedProviders(null);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchConnectedProviders();
  }, []);

  // --- Connect Provider ---
const connectProvider = async (provider: string) => {
  setLoadingButton(provider);
  try {
    const res = await fetch(`/api/accounts/connect/${provider}`, { method: "POST" });
    const data = await res.json();
    console.log("Redirect url: ", data.url)
    if (data.url) {
      // redirect browser to OAuth provider
      window.location.href = data.url;
    } else if (data.error) {
      setError(data.error);
    }
  } catch (e) {
    setError((e as Error).message || "Could not connect provider");
  } finally {
    setLoadingButton(null);
  }
};


  // --- Disconnect Provider ---
  const disconnectProvider = async (provider: string) => {
  setLoadingButton(provider);
  try {
    const res = await fetch(`/api/accounts/disconnect/${provider}`, { method: "POST" });
    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      // just update local state to remove provider
      setConnectedProviders((prev) => (prev || []).filter((p) => p !== provider));
      setError(null);
    }
  } catch (e) {
    setError((e as Error).message || "Could not disconnect provider");
  } finally {
    setLoadingButton(null);
  }
};

  return (
    <Card className={`${cardClasses.accounts}`}>
      <CardHeader className="text-center">
        <CardTitle>Connected Accounts</CardTitle>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {loadingProviders ? (
          <div className="text-center">Loading providers...</div>
        ) : connectedProviders === null ? (
          <button
            onClick={fetchConnectedProviders}
            className="mt-4 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            Get Connected Providers
          </button>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {secondaryProviders.map(({ id, name, svg }: SecondaryProvider) => {
              const isConnected = connectedProviders.includes(id);
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <button
                    data-provider={id} // 👈 custom attribute for clarity
                    onClick={() =>
                      isConnected ? disconnectProvider(id) : connectProvider(id)
                    }
                    disabled={!!loadingButton}
                    className={clsx(
                      buttonClasses.primary,
                      "flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                      isConnected
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-gray-300 hover:bg-green-400"
                    )}
                  >
                    {loadingButton === id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (                      
                       <img src={svg} alt={name} className="mx-2 w-6 h-6" />
                    )}
                  </button>
                  <span className="text-sm text-gray-600">
                    {isConnected ? `Disconnect ${name}` : `Connect ${name}`}
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
