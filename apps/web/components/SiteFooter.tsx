import Link from 'next/link';
import { Logo } from './Logo';
import { RepokenCA } from './RepokenCA';

export function SiteFooter() {
  return (
    <footer className="band-dark" style={{ marginTop: 96 }}>
      <div className="container" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 32,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <Logo color="var(--paper)" />
            <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>
              Your GitHub repo as a token on-chain. Automatic metadata, launched via
              the PONS factory on Robinhood Chain.
            </p>
            <div style={{ marginTop: 18 }}>
              <RepokenCA onDark />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Product
              </div>
              <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                <Link href="/launch" className="nav-link" style={{ alignSelf: 'flex-start' }}>Launch</Link>
                <Link href="/tokens" className="nav-link" style={{ alignSelf: 'flex-start' }}>Tokens</Link>
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Social
              </div>
              <div className="stack" style={{ ['--gap' as string]: '8px' }}>
                <a href="https://x.com/repokendotfun" target="_blank" rel="noreferrer" className="nav-link" style={{ alignSelf: 'flex-start' }}>
                  X
                </a>
                <a href="https://github.com/repoken" target="_blank" rel="noreferrer" className="nav-link" style={{ alignSelf: 'flex-start' }}>
                  GitHub
                </a>
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Chain
              </div>
              <div className="stack mono" style={{ ['--gap' as string]: '8px', fontSize: 14 }}>
                <span className="muted">Robinhood Chain</span>
                <span className="muted">ID 4663</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="rule" style={{ margin: '32px 0 20px' }} />
        <div
          className="mono muted"
          style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}
        >
          <span>© {new Date().getFullYear()} Repoken</span>
          <span>PONS · Robinhood Chain 4663</span>
        </div>
      </div>
    </footer>
  );
}
