import type { RepoTokenDraft } from './github';

/** Standard token metadata JSON (OpenSea-compatible attributes). */
export interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
}

export function draftToMetadata(draft: RepoTokenDraft): TokenMetadata {
  const attributes: TokenMetadata['attributes'] = [
    { trait_type: 'repo', value: draft.repo },
    { trait_type: 'stars', value: draft.stars },
    { trait_type: 'forks', value: draft.forks },
  ];
  if (draft.language) attributes.unshift({ trait_type: 'language', value: draft.language });

  return {
    name: draft.name,
    description: draft.description,
    image: draft.image,
    external_url: draft.externalUrl,
    attributes,
  };
}

/** Resolve an ipfs:// URI to an HTTP gateway URL. */
export function ipfsToHttp(uri: string): string {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'https://ipfs.io/ipfs/';
  if (uri.startsWith('ipfs://')) return gateway + uri.slice('ipfs://'.length);
  return uri;
}

/** Client-side helper: POST metadata to our own /api/ipfs route, returns ipfs:// URI. */
export async function uploadMetadata(metadata: TokenMetadata): Promise<string> {
  const res = await fetch('/api/ipfs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`IPFS upload failed (${res.status}) ${msg}`);
  }
  const data = (await res.json()) as { uri: string };
  return data.uri;
}
