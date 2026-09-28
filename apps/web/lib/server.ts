import { createPublicClient, http } from 'viem';
import { robinhoodChain } from './chain';

/** Shared read-only client for server components. */
export function getPublicClient() {
  return createPublicClient({
    chain: robinhoodChain,
    transport: http(),
  });
}
