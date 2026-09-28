'use client';

import { useEffect, useState } from 'react';
import { formatEther, type Address } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { robinhoodChain } from '@/lib/chain';
import { feeSplitterAbi } from '@/lib/contracts';

type Phase = 'idle' | 'claiming' | 'done' | 'error';

/**
 * Claims the launch tax accrued in a token's FeeSplitter.
 *
 * `release()` is permissionless — anyone can push the pending balance out, and
 * the contract always splits it 50/50 (treasury / creator). The button shows
 * the pending ETH so it's clear there's something to claim.
 */
export function ClaimFeesButton({ splitter }: { splitter: Address }) {
  const publicClient = usePublicClient({ chainId: robinhoodChain.id });
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [pending, setPending] = useState<bigint | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [msg, setMsg] = useState('');

  async function refresh() {
    if (!publicClient) return;
    try {
      const bal = await publicClient.getBalance({ address: splitter });
      setPending(bal);
    } catch {
      setPending(null);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitter]);

  async function claim() {
    setPhase('claiming');
    setMsg('');
    try {
      const hash = await writeContractAsync({
        address: splitter,
        abi: feeSplitterAbi,
        functionName: 'release',
        chainId: robinhoodChain.id,
      });
      await publicClient!.waitForTransactionReceipt({ hash });
      setPhase('done');
      setMsg('Fees released — 50% treasury, 50% creator.');
      refresh();
    } catch (err) {
      setPhase('error');
      setMsg(err instanceof Error ? err.message.split('\n')[0] : 'Claim failed.');
    }
  }

  const hasPending = pending !== null && pending > 0n;
  const busy = phase === 'claiming';

  return (
    <div className="card" style={{ marginTop: 24 }}>
      <div className="eyebrow">Launch fees</div>
      <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
        The 2% launch tax collects in this token&apos;s fee splitter, then pays out 50% to the
        Repoken treasury (buyback &amp; burn) and 50% to the creator. Releasing is permissionless.
      </p>

      <div className="mono" style={{ marginTop: 14, fontSize: 14 }}>
        pending:{' '}
        <span style={{ color: hasPending ? 'var(--gold)' : 'var(--muted)' }}>
          {pending === null ? '—' : `${Number(formatEther(pending)).toLocaleString(undefined, { maximumFractionDigits: 6 })} ETH`}
        </span>
      </div>

      <button
        className="btn btn-gold"
        style={{ marginTop: 16 }}
        onClick={claim}
        disabled={busy || !isConnected || !hasPending}
      >
        {busy ? 'Claiming…' : 'Claim fees'}
      </button>

      {!isConnected && (
        <p className="mono muted" style={{ marginTop: 10, fontSize: 12 }}>
          Sign in to claim.
        </p>
      )}
      {!hasPending && isConnected && phase !== 'done' && (
        <p className="mono muted" style={{ marginTop: 10, fontSize: 12 }}>
          Nothing to claim yet.
        </p>
      )}
      {msg && (
        <p
          className="mono"
          style={{ marginTop: 10, fontSize: 12, color: phase === 'error' ? '#c0392b' : 'var(--muted)' }}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
