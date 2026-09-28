'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { AccountButton } from './AccountButton';

export function SiteHeader() {
  const pathname = usePathname();
  const onDark = pathname === '/';

  return (
    <header
      className={onDark ? 'band-dark' : ''}
      style={{
        borderBottom: onDark ? '1px solid var(--line-dark)' : '1px solid var(--line)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        <Link href="/" aria-label="Repoken beranda">
          <Logo color={onDark ? 'var(--paper)' : 'var(--ink)'} />
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Link
            href="/tokens"
            className="mono"
            style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            Tokens
          </Link>
          <a
            href="https://x.com/repokendotfun"
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            X
          </a>
          <a
            href="https://github.com/repoken"
            target="_blank"
            rel="noreferrer"
            className="mono"
            style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            GitHub
          </a>
          <AccountButton onDark={onDark} />
        </nav>
      </div>
    </header>
  );
}
