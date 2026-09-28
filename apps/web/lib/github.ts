/** GitHub repo metadata helpers. */

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string; // "owner/repo"
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/** Token-shaped view derived from a repo. */
export interface RepoTokenDraft {
  repo: string; // owner/repo
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl: string;
  language: string | null;
  stars: number;
  forks: number;
}

const API = 'https://api.github.com';

function authHeaders(token?: string): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github+json' };
  if (token) h.Authorization = `Bearer ${token}`;
  // A GitHub token from the server env raises rate limits; optional.
  const serverToken = process.env.GITHUB_TOKEN;
  if (!token && serverToken) h.Authorization = `Bearer ${serverToken}`;
  return h;
}

/**
 * List public repos for a GitHub username.
 * Token launches target public repos, so the public API is sufficient and avoids
 * needing an OAuth access token from the client.
 */
export async function listPublicRepos(username: string, page = 1): Promise<GitHubRepo[]> {
  const res = await fetch(
    `${API}/users/${encodeURIComponent(username)}/repos?per_page=50&sort=updated&page=${page}&type=owner`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`GitHub: failed to load repos for @${username} (${res.status})`);
  return (await res.json()) as GitHubRepo[];
}

/** Fetch a single repo by "owner/repo". Works unauthenticated for public repos. */
export async function getRepo(fullName: string, token?: string): Promise<GitHubRepo> {
  const res = await fetch(`${API}/repos/${fullName}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`GitHub: repo not found (${res.status})`);
  return (await res.json()) as GitHubRepo;
}

/** Derive a ticker symbol from a repo name: uppercase alnum, max 8 chars. */
export function deriveSymbol(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length <= 8) return cleaned || 'REPO';
  // prefer capitals/word boundaries for a compact ticker
  const parts = name.split(/[-_./\s]+/).filter(Boolean);
  if (parts.length > 1) {
    const acronym = parts.map((p) => p[0]).join('').toUpperCase();
    if (acronym.length >= 3 && acronym.length <= 8) return acronym;
  }
  return cleaned.slice(0, 8);
}

/** Map a GitHub repo into a token draft. */
export function repoToDraft(repo: GitHubRepo): RepoTokenDraft {
  return {
    repo: repo.full_name,
    name: repo.name,
    symbol: deriveSymbol(repo.name),
    description: repo.description ?? '',
    image: repo.owner.avatar_url,
    externalUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
  };
}
