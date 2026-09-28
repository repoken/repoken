'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

/** Login / launch entry button driven by Privy auth state. */
export function LoginButton({
  className = 'btn',
  redirectTo,
  children,
}: {
  className?: string;
  redirectTo?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  let ready = false;
  let authenticated = false;
  let login: (() => void) | undefined;

  // usePrivy throws if no PrivyProvider (missing app id). Guard so marketing pages render.
  try {
    const p = usePrivy();
    ready = p.ready;
    authenticated = p.authenticated;
    login = p.login;
  } catch {
    ready = true;
  }

  function onClick() {
    if (authenticated) {
      router.push(redirectTo ?? '/launch');
    } else if (login) {
      login();
    } else {
      router.push('/launch');
    }
  }

  return (
    <button className={className} onClick={onClick} disabled={!ready}>
      {children ?? (authenticated ? 'Open launchpad' : 'Sign in with GitHub')}
    </button>
  );
}
