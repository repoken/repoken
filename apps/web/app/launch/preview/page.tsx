'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAccount, useWriteContract, useSendTransaction, usePublicClient } from 'wagmi';
import Image from 'next/image';
import { loadDraft, saveDraft, saveResult, addLaunch, type LaunchDraft } from '@/lib/draft';
import { draftToMetadata, uploadMetadata, ipfsToHttp } from '@/lib/ipfs';
import { deriveSymbol } from '@/lib/github';
import { SPLITTER_FACTORY_ADDRESS, splitterFactoryAbi } from '@/lib/contracts';
import { robinhoodChain } from '@/lib/chain';
import {
  PONS_STUDIO,
  PONS_LAUNCH_FEE,
  REPOKEN_TAX_BPS,
  buildPonsLaunchCalldata,
  ponsLaunchValue,
  extractLaunchedToken,
} from '@/lib/pons';
import type { Address } from 'viem';

type Phase = 'idle' | 'uploading' | 'signing' | 'confirming' | 'done' | 'error';

export default function PreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<LaunchDraft | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [msg, setMsg] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient({ chainId: robinhoodChain.id });

  let authenticated = false;
  let login: (() => void) | undefined;
  try {
    const p = usePrivy();
    authenticated = p.authenticated;
    login = p.login;
  } catch {
    /* no provider */
  }

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      router.replace('/launch');
      return;
    }
    setDraft(d);
  }, [router]);

  const splitterConfigured = useMemo(
    () => SPLITTER_FACTORY_ADDRESS && !/^0x0+$/.test(SPLITTER_FACTORY_ADDRESS),
    [],
  );

  if (!draft) {
    return (
      <div className="container narrow" style={{ paddingTop: 80 }}>
        <p className="mono muted">Loading…</p>
      </div>
    );
  }

  function update<K extends keyof LaunchDraft>(key: K, value: LaunchDraft[K]) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      saveDraft(next);
      return next;
    });
  }

  async function launch() {
    if (!draft) return;
    setPhase('uploading');
    setMsg('Uploading metadata to IPFS…');
    try {
      const metadata = draftToMetadata(draft);
      const metadataURI = await uploadMetadata(metadata);
      update('metadataURI', metadataURI);

      if (!isConnected || !address) {
        throw new Error('Wallet not connected. Sign in with GitHub to get an embedded wallet.');
      }
      if (!splitterConfigured) {
        throw new Error(
          'Fee splitter not configured (NEXT_PUBLIC_SPLITTER_FACTORY). Deploy SplitterFactory first.',
        );
      }

      // 1. Ensure the per-creator FeeSplitter exists (2% tax → 1% treasury / 1% creator).
      setPhase('signing');
      setMsg('Setting up your fee split (1% buyback · 1% you)…');

      const feeWallet = (await publicClient!.readContract({
        address: SPLITTER_FACTORY_ADDRESS,
        abi: splitterFactoryAbi,
        functionName: 'predict',
        args: [address],
      })) as Address;

      const alreadyDeployed = (await publicClient!.readContract({
        address: SPLITTER_FACTORY_ADDRESS,
        abi: splitterFactoryAbi,
        functionName: 'isDeployed',
        args: [address],
      })) as boolean;

      if (!alreadyDeployed) {
        const splitHash = await writeContractAsync({
          address: SPLITTER_FACTORY_ADDRESS,
          abi: splitterFactoryAbi,
          functionName: 'ensureSplitter',
          args: [address],
          chainId: robinhoodChain.id,
        });
        await publicClient!.waitForTransactionReceipt({ hash: splitHash });
      }

      // 2. Launch on PONS studio with feeWallet = splitter, tax = 2%.
      setMsg('Waiting for launch signature…');
      const data = buildPonsLaunchCalldata({
        name: draft.name,
        symbol: draft.symbol,
        logo: ipfsToHttp(metadataURI),
        description: draft.description,
        socials: { website: draft.externalUrl, twitter: '' },
        creator: address,
        feeWallet,
        taxBps: REPOKEN_TAX_BPS,
        devBuyEth: '0',
      });

      const hash = await sendTransactionAsync({
        to: PONS_STUDIO,
        data,
        value: ponsLaunchValue('0'),
        chainId: robinhoodChain.id,
      });

      setPhase('confirming');
      setMsg('Waiting for on-chain confirmation…');
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      const tokenAddress = extractLaunchedToken(receipt);

      saveResult({
        tokenAddress,
        txHash: hash,
        name: draft.name,
        symbol: draft.symbol,
        repo: draft.repo,
      });
      addLaunch({
        tokenAddress,
        txHash: hash,
        name: draft.name,
        symbol: draft.symbol,
        repo: draft.repo,
        image: draft.image,
        description: draft.description,
        externalUrl: draft.externalUrl,
        metadataURI,
        creator: address,
        launchedAt: Date.now(),
      });
      setPhase('done');
      router.push('/launch/success');
    } catch (err) {
      setPhase('error');
      setMsg(err instanceof Error ? err.message : 'Launch failed.');
    }
  }

  const busy = phase === 'uploading' || phase === 'signing' || phase === 'confirming';

  return (
    <div className="container narrow" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div className="eyebrow">Step 2 / 3</div>
      <h1 style={{ fontSize: 40, marginTop: 10 }}>Preview token.</h1>
      <div className="gold-rule" style={{ marginTop: 18 }} />

      <div className="grid grid-2" style={{ marginTop: 32, alignItems: 'start' }}>
        {/* Editable fields */}
        <div className="stack" style={{ ['--gap' as string]: '18px' }}>
          <div>
            <label className="lab">Token name</label>
            <input className="field" value={draft.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div>
            <label className="lab">Symbol</label>
            <input
              className="field field-mono"
              value={draft.symbol}
              maxLength={11}
              onChange={(e) => update('symbol', deriveSymbol(e.target.value))}
            />
          </div>
          <div>
            <label className="lab">Supply</label>
            <input className="field field-mono" value="1,000,000,000 (fixed by PONS)" disabled />
          </div>
          <div>
            <label className="lab">Description</label>
            <textarea
              className="field"
              rows={3}
              value={draft.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
        </div>

        {/* Live preview card */}
        <div className="card" style={{ background: '#f8f6f0' }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Token card
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {draft.image && (
              <Image
                src={draft.image}
                alt=""
                width={56}
                height={56}
                style={{ borderRadius: 8, border: '1px solid var(--line)' }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{draft.name || '—'}</div>
              <div className="mono" style={{ color: 'var(--gold)', fontSize: 14 }}>
                ${draft.symbol || '—'}
              </div>
            </div>
          </div>
          <hr className="rule" style={{ margin: '16px 0' }} />
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
            <dt className="mono muted" style={{ fontSize: 13 }}>repo</dt>
            <dd className="mono" style={{ margin: 0, fontSize: 13, wordBreak: 'break-all' }}>{draft.repo}</dd>
            <dt className="mono muted" style={{ fontSize: 13 }}>supply</dt>
            <dd className="mono" style={{ margin: 0, fontSize: 13 }}>1,000,000,000</dd>
            <dt className="mono muted" style={{ fontSize: 13 }}>tax</dt>
            <dd className="mono" style={{ margin: 0, fontSize: 13 }}>2% · 1% buyback / 1% you</dd>
            {draft.language && (
              <>
                <dt className="mono muted" style={{ fontSize: 13 }}>lang</dt>
                <dd className="mono" style={{ margin: 0, fontSize: 13 }}>{draft.language}</dd>
              </>
            )}
            <dt className="mono muted" style={{ fontSize: 13 }}>stars</dt>
            <dd className="mono" style={{ margin: 0, fontSize: 13 }}>{draft.stars}</dd>
          </dl>
        </div>
      </div>

      {/* Status + actions */}
      {msg && (
        <div
          className="card"
          style={{
            marginTop: 24,
            borderColor: phase === 'error' ? 'var(--bad)' : 'var(--line)',
            color: phase === 'error' ? 'var(--bad)' : 'inherit',
          }}
        >
          <span className="mono" style={{ fontSize: 14 }}>
            {busy && <span className="spin" style={{ display: 'inline-block', marginRight: 8 }}>◠</span>}
            {msg}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" onClick={() => router.push('/launch')} disabled={busy}>
          ← Change repo
        </button>
        {!authenticated && login ? (
          <button className="btn" onClick={() => login?.()}>
            Sign in to launch
          </button>
        ) : (
          <button className="btn btn-gold" onClick={launch} disabled={busy}>
            {busy ? 'Processing…' : 'Launch token'}
          </button>
        )}
      </div>

      <p className="mono muted" style={{ marginTop: 16, fontSize: 12 }}>
        Launches via the PONS studio. 2% tax → 1% to $REPOKEN buyback &amp; burn, 1% to you.
      </p>
      {!splitterConfigured && (
        <p className="mono muted" style={{ marginTop: 8, fontSize: 12 }}>
          Note: NEXT_PUBLIC_SPLITTER_FACTORY is not set — deploy SplitterFactory and set the env to enable launches.
        </p>
      )}
    </div>
  );
}
