import { GoogleProviderClient } from '@/context/googleProviderClient';
import { ReactNode } from 'react';

export default function GoogleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <GoogleProviderClient>{children}</GoogleProviderClient>;
}