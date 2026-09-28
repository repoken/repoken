import { http, createConfig } from 'wagmi';
import { robinhoodChain } from './chain';

/** Wagmi config bound to Robinhood Chain, used via @privy-io/wagmi provider. */
export const wagmiConfig = createConfig({
  chains: [robinhoodChain],
  transports: {
    [robinhoodChain.id]: http(),
  },
});
