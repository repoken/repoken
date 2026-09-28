'use client';

import type { RepoTokenDraft } from './github';

const KEY = 'repoken:draft';

export interface LaunchDraft extends RepoTokenDraft {
  supply: string; // human string, e.g. "1000000000"
  metadataURI?: string;
}

export function saveDraft(draft: LaunchDraft) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function loadDraft(): LaunchDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LaunchDraft;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}

const RESULT_KEY = 'repoken:result';

export interface LaunchResult {
  tokenAddress: string;
  txHash: string;
  name: string;
  symbol: string;
  repo: string;
}

export function saveResult(r: LaunchResult) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
}

export function loadResult(): LaunchResult | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LaunchResult;
  } catch {
    return null;
  }
}

// --- Local launch registry ---------------------------------------------------
// PONS mints plain ERC-20 clones with no Repoken-specific on-chain fields, and
// the studio has no per-project registry. We keep a browser-local list of
// launches (with their IPFS metadata) so /tokens can show them. This list is
// per-browser, not global — a deliberate MVP trade-off, not an on-chain index.

const REGISTRY_KEY = 'repoken:launches';

export interface LaunchRecord {
  tokenAddress: string;
  txHash: string;
  name: string;
  symbol: string;
  repo: string;
  image?: string;
  description?: string;
  externalUrl?: string;
  metadataURI?: string;
  creator?: string;
  /** Per-creator FeeSplitter that receives the 2% launch tax (50/50 split). */
  splitter?: string;
  launchedAt: number; // epoch ms
}

export function addLaunch(rec: LaunchRecord) {
  if (typeof window === 'undefined') return;
  const list = listLaunches().filter(
    (l) => l.tokenAddress.toLowerCase() !== rec.tokenAddress.toLowerCase(),
  );
  list.unshift(rec);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(list));
}

export function listLaunches(): LaunchRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(REGISTRY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LaunchRecord[];
  } catch {
    return [];
  }
}

export function getLaunch(address: string): LaunchRecord | null {
  const addr = address.toLowerCase();
  return listLaunches().find((l) => l.tokenAddress.toLowerCase() === addr) ?? null;
}
