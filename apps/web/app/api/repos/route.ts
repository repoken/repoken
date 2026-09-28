import { NextResponse } from 'next/server';
import { listPublicRepos, repoToDraft } from '@/lib/github';

export const runtime = 'nodejs';

/**
 * List public repos for a GitHub username.
 * Usage: GET /api/repos?username=octocat&page=1
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username')?.trim();
  const page = Number(url.searchParams.get('page') ?? '1') || 1;

  if (!username) {
    return NextResponse.json({ error: 'The username parameter is required.' }, { status: 400 });
  }

  try {
    const repos = await listPublicRepos(username, page);
    return NextResponse.json({ repos: repos.map(repoToDraft) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
