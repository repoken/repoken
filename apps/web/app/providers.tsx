'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { PRIVY_APP_ID, privyConfig } from '@/lib/privy';
import { wagmiConfig } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Without a Privy app id, use the plain wagmi provider. @privy-io/wagmi's
  // WagmiProvider depends on PrivyProvider context (it calls useWallets), so it
  // must never be rendered without a PrivyProvider around it.
  if (!PRIVY_APP_ID) {
    if (typeof window !== 'undefined') {
      console.warn('NEXT_PUBLIC_PRIVY_APP_ID is not set — GitHub login will not work.');
    }
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={wagmiConfig}>{children}</PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
