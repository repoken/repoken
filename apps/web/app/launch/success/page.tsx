'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadResult, clearDraft, type LaunchResult } from '@/lib/draft';
import { RepocatMark } from '@/components/Logo';

export default function SuccessPage() {
  const router = useRouter();
  const [result, setResult] = useState<LaunchResult | null>(null);

  useEffect(() => {
    const r = loadResult();
    if (!r) {
      router.replace('/launch');
      return;
    }
    setResult(r);
    clearDraft();
  }, [router]);

  if (!result) {
    return (
      <div className="container narrow" style={{ paddingTop: 80 }}>
        <p className="mono muted">Loading…</p>
      </div>
    );
  }

  const tweet = encodeURIComponent(
    `Just turned ${result.repo} into $${result.symbol} on-chain with @repoken 🐈\n\nPONS · Robinhood Chain`,
  );

  return (
    <div className="container narrow" style={{ paddingTop: 64, paddingBottom: 40, textAlign: 'center' }}>
      <div className="pop-in" style={{ display: 'flex', justifyContent: 'center' }}>
        <RepocatMark size={72} color="var(--ink)" branch />
      </div>
      <div className="eyebrow enter" style={{ marginTop: 20, ['--d' as string]: '120ms' }}>
        Step 3 / 3 · Done
      </div>
      <h1 className="enter" style={{ fontSize: 44, marginTop: 10, ['--d' as string]: '180ms' }}>
        ${result.symbol} is live.
      </h1>
      <p className="muted enter" style={{ marginTop: 12, ['--d' as string]: '240ms' }}>
        Token <strong>{result.name}</strong> from <span className="mono">{result.repo}</span> has been
        deployed on Robinhood Chain.
      </p>

      <div className="card enter" style={{ marginTop: 28, textAlign: 'left', background: '#f8f6f0', ['--d' as string]: '300ms' }}>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px' }}>
          <dt className="mono muted" style={{ fontSize: 13 }}>token</dt>
          <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>
            {result.tokenAddress || '—'}
          </dd>
          <dt className="mono muted" style={{ fontSize: 13 }}>tx</dt>
          <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>
            {result.txHash}
          </dd>
        </dl>
      </div>

      <div className="enter" style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap', ['--d' as string]: '360ms' }}>
        {result.tokenAddress && (
          <Link href={`/tokens/${result.tokenAddress}`} className="btn">
            View token page
          </Link>
        )}
        <a
          className="btn btn-gold"
          href={`https://x.com/intent/tweet?text=${tweet}`}
          target="_blank"
          rel="noreferrer"
        >
          Share on X
        </a>
        <Link href="/launch" className="btn btn-ghost">
          Launch another
        </Link>
      </div>
    </div>
  );
}
