'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { RepoTokenDraft } from '@/lib/github';
import { saveDraft } from '@/lib/draft';

const DEFAULT_SUPPLY = '1000000000';

export default function LaunchPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<RepoTokenDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUser, setManualUser] = useState('');
  const [q, setQ] = useState('');

  let ready = true;
  let authenticated = false;
  let username: string | undefined;
  let login: (() => void) | undefined;
  try {
    const p = usePrivy();
    ready = p.ready;
    authenticated = p.authenticated;
    username = p.user?.github?.username ?? undefined;
    login = p.login;
  } catch {
    // no provider configured
  }

  async function fetchRepos(user: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/repos?username=${encodeURIComponent(user)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load repos');
      setRepos(data.repos as RepoTokenDraft[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repos');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (username) fetchRepos(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  function select(repo: RepoTokenDraft) {
    saveDraft({ ...repo, supply: DEFAULT_SUPPLY });
    router.push('/launch/preview');
  }

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.repo.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="container narrow" style={{ paddingTop: 56, paddingBottom: 40 }}>
      <div className="eyebrow">Step 1 / 3</div>
      <h1 style={{ fontSize: 40, marginTop: 10 }}>Pick a repo.</h1>
      <div className="gold-rule" style={{ marginTop: 18 }} />
      <p className="muted" style={{ marginTop: 18 }}>
        Token metadata is pulled automatically from the repo you choose.
      </p>

      {/* Auth / username source */}
      {!authenticated && (
        <div className="card" style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 18 }}>Sign in to load your repos</h3>
          <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>
            Sign in with GitHub via Privy, or type a GitHub username to browse public repos.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {login && (
              <button className="btn" onClick={() => login?.()} disabled={!ready}>
                Sign in with GitHub
              </button>
            )}
            <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 260 }}>
              <input
                className="field field-mono"
                placeholder="GitHub username"
                value={manualUser}
                onChange={(e) => setManualUser(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && manualUser && fetchRepos(manualUser)}
              />
              <button
                className="btn btn-ghost"
                onClick={() => manualUser && fetchRepos(manualUser)}
                disabled={!manualUser}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {repos.length > 0 && (
        <input
          className="field"
          placeholder="Filter repos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginTop: 28 }}
        />
      )}

      {error && (
        <div className="card" style={{ marginTop: 20, borderColor: 'var(--bad)', color: 'var(--bad)' }}>
          {error}
        </div>
      )}

      {loading && (
        <p className="mono muted" style={{ marginTop: 24 }}>
          Loading repos…
        </p>
      )}

      {/* Repo list */}
      <div className="stack" style={{ marginTop: 20, ['--gap' as string]: '12px' }}>
        {filtered.map((repo) => (
          <button
            key={repo.repo}
            className="card card-hover"
            onClick={() => select(repo)}
            style={{ textAlign: 'left', cursor: 'pointer', display: 'block', width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{repo.name}</div>
                <div className="mono muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {repo.repo}
                </div>
                {repo.description && (
                  <p className="muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 520 }}>
                    {repo.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {repo.language && <span className="tag">{repo.language}</span>}
                <span className="tag">★ {repo.stars}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {!loading && repos.length === 0 && !error && (
        <p className="muted" style={{ marginTop: 32 }}>
          No repos yet. Sign in or search a username first.
        </p>
      )}
    </div>
  );
}
