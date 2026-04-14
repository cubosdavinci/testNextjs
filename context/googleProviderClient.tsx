'use client';

import { GoogleProvider } from '@/context/GoogleContext';

export function GoogleProviderClient({ children }: { children: React.ReactNode }) {
  return <GoogleProvider>{children}</GoogleProvider>;
}