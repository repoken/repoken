'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPublicClient, http, formatUnits, isAddress, erc20Abi, type Address } from 'viem';
import { robinhoodChain } from '@/lib/chain';
import { getLaunch, type LaunchRecord } from '@/lib/draft';
import { ipfsToHttp } from '@/lib/ipfs';

interface TokenView {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const addr = params.address;
  const valid = isAddress(addr);

  const [onchain, setOnchain] = useState<TokenView | null>(null);
  const [local, setLocal] = useState<LaunchRecord | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    if (!valid) return;
    setLocal(getLaunch(addr));
    const client = createPublicClient({ chain: robinhoodChain, transport: http() });
    const base = { address: addr as Address, abi: erc20Abi } as const;
    Promise.all([
      client.readContract({ ...base, functionName: 'name' }),
      client.readContract({ ...base, functionName: 'symbol' }),
      client.readContract({ ...base, functionName: 'decimals' }),
      client.readContract({ ...base, functionName: 'totalSupply' }),
    ])
      .then(([name, symbol, decimals, totalSupply]) => {
        setOnchain({
          name: name as string,
          symbol: symbol as string,
          decimals: decimals as number,
          totalSupply: totalSupply as bigint,
        });
        setState('ok');
      })
      .catch(() => setState('notfound'));
  }, [addr, valid]);

  if (!valid) {
    return (
      <div className="container narrow" style={{ paddingTop: 64 }}>
        <h1 style={{ fontSize: 32 }}>Invalid address</h1>
        <Link href="/tokens" className="btn" style={{ marginTop: 20 }}>
          ← All tokens
        </Link>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="container narrow" style={{ paddingTop: 64 }}>
        <p className="muted mono">Reading token on Robinhood Chain…</p>
      </div>
    );
  }

  if (state === 'notfound' && !local) {
    return (
      <div className="container narrow" style={{ paddingTop: 64 }}>
        <div className="eyebrow">Token</div>
        <h1 style={{ fontSize: 32, marginTop: 10 }}>Token not found</h1>
        <p className="muted" style={{ marginTop: 10 }}>
          Address <span className="mono">{addr}</span> can’t be read on Robinhood Chain.
        </p>
        <Link href="/tokens" className="btn" style={{ marginTop: 20 }}>
          ← All tokens
        </Link>
      </div>
    );
  }

  const name = onchain?.name ?? local?.name ?? 'Token';
  const symbol = onchain?.symbol ?? local?.symbol ?? '';
  const decimals = onchain?.decimals ?? 18;
  const image = local?.image ? ipfsToHttp(local.image) : '';
  const repo = local?.repo;
  const repoUrl = local?.externalUrl || (repo ? `https://github.com/${repo}` : undefined);

  return (
    <div className="container narrow" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <Link href="/tokens" className="mono muted" style={{ fontSize: 13 }}>
        ← All tokens
      </Link>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 24 }}>
        {image && (
          <Image
            src={image}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: 10, border: '1px solid var(--line)' }}
          />
        )}
        <div>
          <h1 style={{ fontSize: 38 }}>{name}</h1>
          <div className="mono" style={{ color: 'var(--gold)', fontSize: 18 }}>
            ${symbol}
          </div>
        </div>
      </div>

      <div className="gold-rule" style={{ marginTop: 22 }} />

      {local?.description && <p style={{ marginTop: 22, fontSize: 18 }}>{local.description}</p>}

      <div className="card" style={{ marginTop: 24, background: '#f8f6f0' }}>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 20px' }}>
          <dt className="mono muted" style={{ fontSize: 13 }}>contract</dt>
          <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>{addr}</dd>

          {repo && (
            <>
              <dt className="mono muted" style={{ fontSize: 13 }}>repo</dt>
              <dd className="mono" style={{ margin: 0, fontSize: 13 }}>
                <a href={repoUrl} target="_blank" rel="noreferrer" style={{ borderBottom: '1px solid var(--gold)' }}>
                  {repo}
                </a>
              </dd>
            </>
          )}

          {onchain && (
            <>
              <dt className="mono muted" style={{ fontSize: 13 }}>supply</dt>
              <dd className="mono" style={{ margin: 0, fontSize: 13 }}>
                {Number(formatUnits(onchain.totalSupply, decimals)).toLocaleString()} ${symbol}
              </dd>
            </>
          )}

          {local?.creator && (
            <>
              <dt className="mono muted" style={{ fontSize: 13 }}>creator</dt>
              <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>{local.creator}</dd>
            </>
          )}

          {local?.txHash && (
            <>
              <dt className="mono muted" style={{ fontSize: 13 }}>launch tx</dt>
              <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>
                <a
                  href={`${robinhoodChain.blockExplorers.default.url}/tx/${local.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ borderBottom: '1px solid var(--gold)' }}
                >
                  {local.txHash}
                </a>
              </dd>
            </>
          )}

          {local?.metadataURI && (
            <>
              <dt className="mono muted" style={{ fontSize: 13 }}>metadata</dt>
              <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>
                <a href={ipfsToHttp(local.metadataURI)} target="_blank" rel="noreferrer" style={{ borderBottom: '1px solid var(--gold)' }}>
                  {local.metadataURI}
                </a>
              </dd>
            </>
          )}
        </dl>
      </div>

      <div style={{ marginTop: 24 }}>
        <a
          href={`${robinhoodChain.blockExplorers.default.url}/address/${addr}`}
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          View on Blockscout
        </a>
      </div>
    </div>
  );
}
