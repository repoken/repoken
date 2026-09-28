import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL('https://repoken.fun'),
  title: {
    default: 'Repoken — Your GitHub repo as a token on-chain',
    template: '%s · Repoken',
  },
  description:
    'Launch a token from your GitHub repo, straight into the PONS ecosystem on Robinhood Chain.',
  openGraph: {
    title: 'Repoken',
    description: 'Your GitHub repo as a token on-chain. PONS · Robinhood Chain 4663.',
    images: ['/banner-1500x500.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repoken',
    description: 'Your GitHub repo as a token on-chain.',
    images: ['/banner-1500x500.png'],
  },
  icons: { icon: '/logo-mark-dark.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
