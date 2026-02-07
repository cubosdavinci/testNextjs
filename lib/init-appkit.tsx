// lib/init-appkit.ts   ("use client" required here)

"use client";

import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId, networks } from './config/reown'; // adjust path

// Call this once — safe to run at module level in client context
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Yogi3',
    description: 'Your dApp description',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev',
    icons: ['https://3000-cs-996772579179-default.cs-europe-west1-xedi.cloudshell.dev/favicon.ico'], // use real URL
  },
  // features: { email: false, socials: false }, // optional
});