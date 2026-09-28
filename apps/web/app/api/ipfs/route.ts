import { NextResponse } from 'next/server';
import type { TokenMetadata } from '@/lib/ipfs';

export const runtime = 'nodejs';

/**
 * Pin token metadata JSON to IPFS via QuickNode IPFS (Filebase-backed).
 * Server-side only so the QUICKNODE_IPFS_KEY never reaches the browser.
 */
export async function POST(req: Request) {
  const key = process.env.QUICKNODE_IPFS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'QUICKNODE_IPFS_KEY is not set on the server.' },
      { status: 500 },
    );
  }

  let metadata: TokenMetadata;
  try {
    metadata = (await req.json()) as TokenMetadata;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!metadata?.name || !metadata?.image) {
    return NextResponse.json({ error: 'Metadata must include name and image.' }, { status: 400 });
  }

  const safeName = metadata.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 48) || 'token';
  const filename = `repoken-${safeName}-${Date.now()}.json`;

  const form = new FormData();
  form.append('Body', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), filename);
  form.append('Key', filename);
  form.append('ContentType', 'application/json');

  const res = await fetch('https://api.quicknode.com/ipfs/rest/v1/s3/put-object', {
    method: 'POST',
    headers: { 'x-api-key': key },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return NextResponse.json(
      { error: `QuickNode IPFS failed (${res.status})`, detail },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { pin?: { cid?: string } };
  const cid = data?.pin?.cid;
  if (!cid) {
    return NextResponse.json({ error: 'QuickNode IPFS returned no CID.' }, { status: 502 });
  }
  return NextResponse.json({ uri: `ipfs://${cid}`, cid });
}
