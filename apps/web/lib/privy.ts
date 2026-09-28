import type { PrivyClientConfig } from '@privy-io/react-auth';
import { robinhoodChain } from './chain';

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

/**
 * Privy client config.
 * - GitHub is the only login method (matches the product: "login with the repo host").
 * - An embedded wallet is created for users without an external wallet, so anyone
 *   who can log in with GitHub can sign the launch tx.
 */
export const privyConfig: PrivyClientConfig = {
  loginMethods: ['github'],
  appearance: {
    theme: '#0b0d10',
    accentColor: '#E4B04A',
    logo: '/logo-mark-light.png',
    walletChainType: 'ethereum-only',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    showWalletUIs: true,
  },
  defaultChain: robinhoodChain,
  supportedChains: [robinhoodChain],
};
