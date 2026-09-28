'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { listLaunches, type LaunchRecord } from '@/lib/draft';
import { ipfsToHttp } from '@/lib/ipfs';

type SortKey = 'new' | 'trending' | 'top';

const TABS: { key: SortKey; label: string; hint: string }[] = [
  { key: 'new', label: 'New', hint: 'Latest launches first' },
  { key: 'trending', label: 'Trending', hint: 'Launched in the last 7 days' },
  { key: 'top', label: 'Top', hint: 'Longest-standing launches' },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function TokensPage() {
  const [rows, setRows] = useState<LaunchRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [sort, setSort] = useState<SortKey>('new');

  useEffect(() => {
    setRows(listLaunches());
    setReady(true);
  }, []);

  const sorted = useMemo(() => {
    const list = [...rows];
    const now = Date.now();
    switch (sort) {
      case 'trending':
        return list
          .filter((r) => now - (r.launchedAt ?? 0) <= WEEK_MS)
          .sort((a, b) => (b.launchedAt ?? 0) - (a.launchedAt ?? 0));
      case 'top':
        return list.sort((a, b) => (a.launchedAt ?? 0) - (b.launchedAt ?? 0));
      case 'new':
      default:
        return list.sort((a, b) => (b.launchedAt ?? 0) - (a.launchedAt ?? 0));
    }
  }, [rows, sort]);

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div className="eyebrow">Your launches</div>
      <h1 style={{ fontSize: 40, marginTop: 10 }}>Launched tokens.</h1>
      <div className="gold-rule" style={{ marginTop: 18 }} />

      <p className="muted" style={{ marginTop: 18, maxWidth: 560, fontSize: 14 }}>
        This list is stored in your browser. Tokens live on Robinhood Chain — open one to see its
        contract and trade it on PONS.
      </p>

      {ready && rows.length > 0 && (
        <div
          role="tablist"
          aria-label="Sort tokens"
          style={{ display: 'flex', gap: 8, marginTop: 28, flexWrap: 'wrap' }}
        >
          {TABS.map((t) => {
            const active = sort === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                title={t.hint}
                onClick={() => setSort(t.key)}
                className="mono"
                style={{
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '8px 16px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                  background: active ? 'var(--ink)' : 'transparent',
                  color: active ? 'var(--paper)' : 'var(--muted)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {ready && rows.length === 0 && (
        <div className="card" style={{ marginTop: 32 }}>
          <p className="muted">No launches yet from this browser. Be the first.</p>
          <Link href="/launch" className="btn" style={{ marginTop: 16 }}>
            Launch token
          </Link>
        </div>
      )}

      {ready && rows.length > 0 && sorted.length === 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <p className="muted">Nothing here right now. Try another tab.</p>
        </div>
      )}

      <div className="grid grid-3" style={{ marginTop: 24 }}>
        {sorted.map((r) => (
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
