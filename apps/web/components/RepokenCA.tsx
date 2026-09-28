import { CHAIN_ID } from '@/lib/chain';

const BLOCKSCOUT = 'https://robinhoodchain.blockscout.com';

/**
 * $REPOKEN contract-address badge. Shows a live address with a Blockscout link
 * once NEXT_PUBLIC_REPOKEN_CA is set, otherwise a clear "not live yet" state.
 */
export function RepokenCA({
  onDark = false,
  align = 'start',
}: {
  onDark?: boolean;
  align?: 'start' | 'center';
}) {
  const ca = process.env.NEXT_PUBLIC_REPOKEN_CA?.trim() || '';
  const live = /^0x[a-fA-F0-9]{40}$/.test(ca);

  return (
    <div
      className="mono"
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        padding: '9px 14px',
        border: `1px solid ${live ? 'var(--gold)' : onDark ? 'var(--line-dark)' : 'var(--line)'}`,
        borderRadius: 8,
        fontSize: 13,
        background: onDark ? 'rgba(255,255,255,0.03)' : '#f8f6f0',
      }}
    >
      <span className={`dot ${live ? 'dot--live' : ''}`} aria-hidden />
      <span style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.04em' }}>
        $REPOKEN
      </span>
      <span className="muted">CA</span>
      {live ? (
        <a
          href={`${BLOCKSCOUT}/token/${ca}`}
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          style={{ color: onDark ? 'var(--paper)' : 'var(--ink)', wordBreak: 'break-all' }}
          title={`View $REPOKEN on Blockscout (chain ${CHAIN_ID})`}
        >
          {ca}
        </a>
      ) : (
        <span style={{ color: onDark ? 'var(--paper)' : 'var(--ink)' }}>not live yet</span>
      )}
    </div>
  );
}
