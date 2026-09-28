'use client';

import { usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Shows login CTA or the connected GitHub handle + wallet + logout. */
export function AccountButton({ onDark }: { onDark?: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  let ready = true;
  let authenticated = false;
  let handle: string | undefined;
  let login: (() => void) | undefined;
  let logout: (() => void) | undefined;
  let exportWallet: (() => Promise<void>) | undefined;
  let walletAddress: string | undefined;

  try {
    const p = usePrivy();
    ready = p.ready;
    authenticated = p.authenticated;
    login = p.login;
    logout = p.logout;
    exportWallet = p.exportWallet;
    handle = p.user?.github?.username ?? undefined;
  } catch {
    // No PrivyProvider (missing app id) — render a plain launch link.
    return (
      <button className="btn" onClick={() => router.push('/launch')}>
        Launch
      </button>
    );
  }

  try {
    const { wallets } = useWallets();
    walletAddress = (getEmbeddedConnectedWallet(wallets) ?? wallets[0])?.address;
  } catch {
    /* wallets not ready */
  }

  async function copyAddress() {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const short = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : undefined;

  if (!ready) {
    return (
      <span className="mono muted" style={{ fontSize: 13 }}>
        …
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button className={onDark ? 'btn btn-gold' : 'btn'} onClick={() => login?.()}>
        Sign in with GitHub
      </button>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {handle && (
        <span className="mono" style={{ fontSize: 13 }}>
          @{handle}
        </span>
      )}
      {short && (
        <button
          className="mono"
          title="Copy wallet address"
          onClick={copyAddress}
          style={{
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: onDark ? 'var(--paper)' : 'var(--gold)',
            padding: 0,
          }}
        >
          {copied ? 'copied ✓' : short}
        </button>
      )}
      {exportWallet && walletAddress && (
        <button
          className="btn btn-ghost"
          style={{ padding: '8px 12px', color: onDark ? 'var(--paper)' : 'var(--ink)', borderColor: onDark ? 'var(--paper)' : 'var(--ink)' }}
          onClick={() => exportWallet?.()}
        >
          Export wallet
        </button>
      )}
      <button
        className="btn btn-ghost"
        style={{ padding: '8px 12px', color: onDark ? 'var(--paper)' : 'var(--ink)', borderColor: onDark ? 'var(--paper)' : 'var(--ink)' }}
        onClick={() => logout?.()}
      >
        Sign out
      </button>
    </span>
  );
}
