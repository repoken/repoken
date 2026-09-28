import Link from 'next/link';
import { RepocatMark } from '@/components/Logo';
import { LoginButton } from '@/components/LoginButton';

const STEPS = [
  { n: '01', t: 'Sign in with GitHub', d: 'Log in via Privy. Get an embedded wallet automatically if you don’t have one.' },
  { n: '02', t: 'Pick a repo', d: 'Load your repos. Metadata is pulled straight from GitHub.' },
  { n: '03', t: 'Preview token', d: 'Name, symbol, supply, image — all prefilled from the repo. Edit if needed.' },
  { n: '04', t: 'Sign & deploy', d: 'One signature. Token goes live on PONS, Robinhood Chain.' },
];

const MAP = [
  ['repo.name', 'Token name'],
  ['repo.description', 'Description'],
  ['owner.avatar_url', 'Token image'],
  ['repo.html_url', 'External link'],
  ['repo.language', 'Tag / category'],
  ['repo.stargazers_count', 'Display metric'],
];

export default function HomePage() {
  return (
    <>
      {/* Hero — dark band, asymmetric: text left, big mark right */}
      <section className="band-dark" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gap: 40,
            gridTemplateColumns: '1fr',
            paddingTop: 84,
            paddingBottom: 84,
            alignItems: 'center',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow">Launchpad · PONS · Robinhood Chain 4663</div>
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 72px)', marginTop: 18, color: 'var(--paper)' }}>
              Your GitHub repo,
              <br />
              as a token on-chain.
            </h1>
            <div className="gold-rule" style={{ marginTop: 24 }} />
            <p className="muted" style={{ fontSize: 19, marginTop: 22, maxWidth: 520 }}>
              Repoken pulls metadata straight from your repo, then deploys a token via
              the PONS factory. No contracts to write, no long forms to fill.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
              <LoginButton className="btn btn-gold" redirectTo="/launch" />
              <Link href="/tokens" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }}>
                Browse launched tokens
              </Link>
            </div>
          </div>
        </div>
        {/* oversized watermark mark, clipped at the right edge */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '-4%',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.06,
            pointerEvents: 'none',
          }}
        >
          <RepocatMark size={520} color="var(--paper)" branch />
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ paddingTop: 72 }}>
        <div className="eyebrow">Flow</div>
        <h2 style={{ fontSize: 34, marginTop: 10 }}>Four steps, one transaction.</h2>
        <div className="grid grid-2" style={{ marginTop: 28 }}>
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ display: 'flex', gap: 18 }}>
              <span className="mono" style={{ color: 'var(--gold)', fontSize: 15, fontWeight: 700 }}>
                {s.n}
              </span>
              <div>
                <h3 style={{ fontSize: 20 }}>{s.t}</h3>
                <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>
                  {s.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metadata mapping — the distinctive, product-specific bit */}
      <section className="container" style={{ paddingTop: 72 }}>
        <div className="eyebrow">Mapping</div>
        <h2 style={{ fontSize: 34, marginTop: 10 }}>From GitHub fields to token metadata.</h2>
        <div
          className="card"
          style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}
        >
          {MAP.map(([from, to], i) => (
            <div
              key={from}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}
            >
              <code className="mono" style={{ fontSize: 14 }}>
                {from}
              </code>
              <span className="mono" style={{ color: 'var(--gold)' }}>
                →
              </span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{to}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container" style={{ paddingTop: 72 }}>
        <div
          className="card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            background: '#f8f6f0',
            borderColor: 'var(--ink)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 26 }}>Got a repo worth tokenizing?</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              Sign in, pick a repo, launch. Under a minute.
            </p>
          </div>
          <LoginButton className="btn" redirectTo="/launch" />
        </div>
      </section>
    </>
  );
}
