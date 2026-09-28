/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: '*.quicknode-ipfs.com' },
      { protocol: 'https', hostname: 'ipfs.io' },
    ],
  },
  webpack: (config, { webpack }) => {
    // Optional Coinbase/base-org x402 payment modules are pulled in transitively by
    // @wagmi/connectors but are never used by Repoken (we only use the Privy wallet).
    // Ignore them so the build doesn't fail on missing optional deps.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@x402\//,
      }),
    );
    // Silence optional transport warnings from walletconnect deps.
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
