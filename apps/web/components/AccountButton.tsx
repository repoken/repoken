'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

/** Shows login CTA or the connected GitHub handle + logout. */
export function AccountButton({ onDark }: { onDark?: boolean }) {
  const router = useRouter();

  let ready = true;
  let authenticated = false;
  let handle: string | undefined;
  let login: (() => void) | undefined;
  let logout: (() => void) | undefined;

  try {
    const p = usePrivy();
    ready = p.ready;
    authenticated = p.authenticated;
    login = p.login;
    logout = p.logout;
    handle = p.user?.github?.username ?? undefined;
  } catch {
    // No PrivyProvider (missing app id) — render a plain launch link.
    return (
      <button className="btn" onClick={() => router.push('/launch')}>
        Launch
      </button>
    );
  }

  if (!ready) {
    return (
      <span className="mono muted" style={{ fontSize: 13 }}>
        …
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button className={onDark ? 'btn btn-gold' : 'btn'} onClick={() => login?.()}>
        Sign in with GitHub
      </button>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      {handle && (
        <span className="mono" style={{ fontSize: 13 }}>
          @{handle}
        </span>
      )}
      <button
        className="btn btn-ghost"
        style={{ padding: '8px 12px', color: onDark ? 'var(--paper)' : 'var(--ink)', borderColor: onDark ? 'var(--paper)' : 'var(--ink)' }}
        onClick={() => logout?.()}
      >
        Sign out
      </button>
    </span>
  );
}
