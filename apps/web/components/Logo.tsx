/** Inline Repocat mark — same silhouette as the brand PNGs, as SVG for crisp scaling. */
export function RepocatMark({
  size = 28,
  color = 'currentColor',
  branch = false,
}: {
  size?: number;
  color?: string;
  branch?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
        d="M 256 452 C 196 452 148 430 118 392 C 92 358 84 318 92 280 C 78 236 74 190 84 138 L 90 96 L 176 176 C 200 166 228 160 256 160 C 284 160 312 166 336 176 L 422 96 L 428 138 C 438 190 434 236 420 280 C 428 318 420 358 394 392 C 364 430 316 452 256 452 Z M 180 266 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0 Z M 280 266 a 26 26 0 1 0 52 0 a 26 26 0 1 0 -52 0 Z M 242 318 L 270 318 L 256 336 Z"
      />
      {branch && (
        <>
          <path
            d="M 402 378 C 448 380 470 352 470 320"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={470} cy={312} r={16} fill={color} />
        </>
      )}
    </svg>
  );
}

export function Wordmark({ color }: { color?: string }) {
  return (
    <span
      style={{
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: '-0.03em',
        color,
      }}
    >
      repoken
    </span>
  );
}

export function Logo({ color, size = 26 }: { color?: string; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <RepocatMark size={size} color={color} />
      <Wordmark color={color} />
    </span>
  );
}
