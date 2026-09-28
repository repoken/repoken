'use client';

import { useEffect, useRef } from 'react';
import { useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useAccount } from 'wagmi';

/**
 * Bridges the Privy embedded wallet into wagmi.
 *
 * After a GitHub login Privy creates an embedded wallet, but wagmi's
 * `useAccount()` stays disconnected until that wallet is set as the active
 * wagmi connector. This component watches the wallet list and activates the
 * embedded wallet once, so `isConnected` / `address` work app-wide.
 *
 * Renders nothing.
 */
export function WalletSync() {
  const { wallets, ready } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected } = useAccount();
  const activating = useRef(false);

  useEffect(() => {
    if (!ready || isConnected || activating.current) return;

    // Prefer the Privy embedded wallet; fall back to the first connected wallet
    // (e.g. an external wallet the user linked).
    const embedded = getEmbeddedConnectedWallet(wallets);
    const target = embedded ?? wallets[0];
    if (!target) return;

    activating.current = true;
    Promise.resolve(setActiveWallet(target)).finally(() => {
      activating.current = false;
    });
  }, [ready, isConnected, wallets, setActiveWallet]);

  return null;
}
