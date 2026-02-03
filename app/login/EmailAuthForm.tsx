"use client";

import { FormEvent } from "react";
import { login, signup } from "./actions"; // your Next.js actions
import Script from "next/script";

interface EmailAuthFormProps {
  siteKey: string; // Cloudflare Turnstile site key
}

export default function EmailAuthForm({ siteKey }: EmailAuthFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Optional: prevent default if you want to handle custom submit
    // e.preventDefault();
  };

  return (
    <div className="mx-auto max-w-sm">
      <form
        className="space-y-4"
        action={login}
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        {/* Turnstile Widget */}
        <input
          type="hidden"
          name="cf_turnstile_response"
          id="cf_turnstile_response"
        />
        <div
          className="cf-turnstile mt-4"
          data-sitekey={siteKey}
          data-theme="light"
          data-callback="turnstileCallback"
        />

        <Script
          id="turnstile-callback"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.turnstileCallback = function(token) {
                const input = document.getElementById("cf_turnstile_response");
                if (input) input.value = token;
              };
            `,
          }}
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded bg-blue-600 py-2 font-semibold text-white"
          >
            Log in
          </button>
          <button
            type="submit"
            formAction={signup}
            className="flex-1 rounded bg-gray-300 py-2 font-semibold"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
