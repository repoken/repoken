'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { listLaunches, type LaunchRecord } from '@/lib/draft';
import { ipfsToHttp } from '@/lib/ipfs';

export default function TokensPage() {
  const [rows, setRows] = useState<LaunchRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRows(listLaunches());
    setReady(true);
  }, []);

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div className="eyebrow">Your launches</div>
      <h1 style={{ fontSize: 40, marginTop: 10 }}>Launched tokens.</h1>
      <div className="gold-rule" style={{ marginTop: 18 }} />

      <p className="muted" style={{ marginTop: 18, maxWidth: 560, fontSize: 14 }}>
        This list is stored in your browser. Tokens live on Robinhood Chain — open one to see its
        contract and trade it on PONS.
      </p>

      {ready && rows.length === 0 && (
        <div className="card" style={{ marginTop: 32 }}>
          <p className="muted">No launches yet from this browser. Be the first.</p>
          <Link href="/launch" className="btn" style={{ marginTop: 16 }}>
            Launch token
          </Link>
        </div>
      )}

      <div className="grid grid-3" style={{ marginTop: 32 }}>
        {rows.map((r) => (
          <Link
            key={r.tokenAddress}
            href={`/tokens/${r.tokenAddress}`}
            className="card card-hover"
            style={{ display: 'block' }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {r.image && (
                <Image
                  src={ipfsToHttp(r.image)}
                  alt=""
                  width={40}
                  height={40}
                  style={{ borderRadius: 8, border: '1px solid var(--line)' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{r.name}</div>
                <div className="mono" style={{ color: 'var(--gold)', fontSize: 14 }}>
                  ${r.symbol}
                </div>
              </div>
            </div>
            <p className="mono muted" style={{ fontSize: 12, marginTop: 10, wordBreak: 'break-all' }}>
              {r.repo}
            </p>
            <hr className="rule" style={{ margin: '12px 0' }} />
            <div className="mono muted" style={{ fontSize: 12, wordBreak: 'break-all' }}>
              {r.tokenAddress}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
