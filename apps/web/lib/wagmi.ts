import { http } from 'wagmi';
import { createConfig } from '@privy-io/wagmi';
import { robinhoodChain } from './chain';

/**
 * Wagmi config bound to Robinhood Chain.
 *
 * Uses `@privy-io/wagmi`'s `createConfig` (not wagmi's) so the config is
 * SSR-safe and compatible with Privy's `WagmiProvider` / `useSetActiveWallet`.
 * Importing wagmi's raw `createConfig` here leaves the embedded wallet
 * unwired, so `useAccount()` stays disconnected after a GitHub login.
 */
export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: {
    [robinhoodChain.id]: http(),
  },
});
