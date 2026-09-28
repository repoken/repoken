import Link from 'next/link';
import { RepocatMark } from '@/components/Logo';
import { LoginButton } from '@/components/LoginButton';
import { Reveal } from '@/components/Reveal';
import { RepokenCA } from '@/components/RepokenCA';

const STEPS = [
  { n: '01', t: 'Sign in with GitHub', d: 'Log in via Privy. Get an embedded wallet automatically if you don’t have one.' },
  { n: '02', t: 'Pick a repo', d: 'Load your repos. Metadata is pulled straight from GitHub.' },
  { n: '03', t: 'Preview token', d: 'Name, symbol, supply, image — all prefilled from the repo. Edit if needed.' },
  { n: '04', t: 'Sign & deploy', d: 'One signature. Token goes live on PONS, Robinhood Chain.' },
];

const MAP: [string, string][] = [
  ['repo.name', 'Token name'],
  ['repo.description', 'Description'],
  ['owner.avatar_url', 'Token image'],
  ['repo.html_url', 'External link'],
  ['repo.language', 'Tag / category'],
  ['repo.stargazers_count', 'Display metric'],
];

const TAX = [
  { pct: '1%', t: '$REPOKEN buyback & burn', d: 'Half the launch tax flows to the treasury to buy back and burn $REPOKEN.' },
  { pct: '1%', t: 'Straight to you', d: 'The other half goes to the creator wallet. Releasing is permissionless.' },
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
            <div className="eyebrow enter" style={{ ['--d' as string]: '40ms' }}>
              Launchpad · PONS · Robinhood Chain 4663
            </div>
            <h1
              className="enter"
              style={{ ['--d' as string]: '110ms', fontSize: 'clamp(40px, 7vw, 72px)', marginTop: 18, color: 'var(--paper)' }}
            >
              Your GitHub repo,
              <br />
              as a token on-chain.
            </h1>
            <div className="gold-rule gold-rule--anim" style={{ marginTop: 24, ['--d' as string]: '320ms' }} />
            <p
              className="muted enter"
              style={{ ['--d' as string]: '200ms', fontSize: 19, marginTop: 22, maxWidth: 520 }}
            >
              Repoken pulls metadata straight from your repo, then deploys a token via
              the PONS factory. No contracts to write, no long forms to fill.
            </p>
            <div
              className="enter"
              style={{ ['--d' as string]: '280ms', display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}
            >
              <LoginButton className="btn btn-gold" redirectTo="/launch" />
              <Link href="/tokens" className="btn btn-ghost" style={{ color: 'var(--paper)', borderColor: 'var(--paper)' }}>
                Browse launched tokens
              </Link>
            </div>
            <div className="enter" style={{ ['--d' as string]: '360ms', marginTop: 28 }}>
              <RepokenCA onDark />
            </div>
          </div>
        </div>
        {/* oversized watermark mark, clipped at the right edge */}
        <div
          aria-hidden
          className="float-mark enter-fade"
          style={{
            position: 'absolute',
            right: '-4%',
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.06,
            pointerEvents: 'none',
            ['--d' as string]: '200ms',
          }}
        >
          <RepocatMark size={520} color="var(--paper)" branch />
        </div>
      </section>

      {/* How it works */}
      <section className="container" style={{ paddingTop: 72 }}>
        <Reveal>
          <div className="eyebrow">Flow</div>
          <h2 style={{ fontSize: 34, marginTop: 10 }}>Four steps, one transaction.</h2>
        </Reveal>
        <div className="grid grid-2" style={{ marginTop: 28 }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div className="card card-hover" style={{ display: 'flex', gap: 18, height: '100%' }}>
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* Metadata mapping — the distinctive, product-specific bit */}
      <section className="container" style={{ paddingTop: 72 }}>
        <Reveal>
          <div className="eyebrow">Mapping</div>
          <h2 style={{ fontSize: 34, marginTop: 10 }}>From GitHub fields to token metadata.</h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
            {MAP.map(([from, to], i) => (
              <div
                key={from}
                className="map-row"
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
                <span className="mono map-arrow" style={{ color: 'var(--gold)' }}>
                  →
                </span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{to}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Tokenomics — the 2% tax split */}
      <section className="container" style={{ paddingTop: 72 }}>
        <Reveal>
          <div className="eyebrow">Tokenomics</div>
          <h2 style={{ fontSize: 34, marginTop: 10 }}>A 2% launch tax, split down the middle.</h2>
        </Reveal>
        <div className="grid grid-2" style={{ marginTop: 28 }}>
          {TAX.map((t, i) => (
            <Reveal key={t.t} delay={i * 90}>
              <div className="card card-hover" style={{ height: '100%' }}>
                <div
                  className="mono"
                  style={{ fontSize: 40, fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.02em' }}
                >
                  {t.pct}
                </div>
                <h3 style={{ fontSize: 20, marginTop: 6 }}>{t.t}</h3>
                <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>
                  {t.d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="container" style={{ paddingTop: 72 }}>
        <Reveal>
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
            <LoginButton className="btn btn-gold" redirectTo="/launch" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
