# Repoken

Turn a GitHub repo into an on-chain token. Repoken pulls a repo's metadata, lets
the owner preview it, and launches an ERC-20 through the PONS factory on
Robinhood Chain (4663) — one signature, fixed supply.

```
Sign in with GitHub → pick a repo → pull metadata → preview → sign & deploy → live on-chain
```

## Structure

```
repoken/
├── apps/web/          Next.js 14 (App Router) — frontend + API routes
│   ├── app/           landing, launch flow, tokens, /api/{ipfs,repos}
│   ├── components/    header, footer, auth + account buttons, logo
│   └── lib/           chain, contracts (ABI), github, ipfs, pons, privy, wagmi
└── contracts/         Foundry (Solidity 0.8.28)
    ├── src/           FeeSplitter, SplitterFactory, RepoToken, PonsTokenFactory
    ├── test/          Foundry tests
    └── script/        Deploy.s.sol, DeploySplitter.s.sol
```

## How the fee split works

Tokens launch on PONS with a 2% launch tax routed to a per-creator `FeeSplitter`.
The splitter forwards the tax 50/50:

- **1%** → the Repoken treasury (buyback + burn of the protocol token)
- **1%** → the token creator

`SplitterFactory` deploys one deterministic (CREATE2) splitter per creator, so the
frontend can predict the address, deploy it once if needed, then launch with
`feeWallet = splitter` and `taxBps = 200`.

## Contracts

```bash
cd contracts
export PATH="$HOME/.foundry/bin:$PATH"
forge build
forge test
```

Deploy the splitter factory:

```bash
cp .env.example .env        # set ROBINHOOD_RPC_URL, PRIVATE_KEY, TREASURY
source .env
TREASURY=$TREASURY forge script script/DeploySplitter.s.sol:DeploySplitter \
  --rpc-url robinhood --broadcast --private-key $PRIVATE_KEY
```

- **FeeSplitter** — immutable 50/50 splitter; anyone can call `release()` /
  `releaseToken()` to push accumulated funds out. Holds no custody.
- **SplitterFactory** — CREATE2 deployer, one splitter per creator,
  permissionless and idempotent.
- **RepoToken** — minimal fixed-supply ERC-20 storing `githubRepo` +
  `metadataURI` on-chain for provenance.
- **PonsTokenFactory** — repo-backed launch registry (one launch per repo slug,
  flat launch fee, `TokenLaunched` event).

> `foundry.toml` reads the RPC endpoint from `ROBINHOOD_RPC_URL`. Never commit a
> real key or private key — use `.env` (gitignored) or a keystore.

## Web

```bash
cd apps/web
cp .env.example .env.local     # fill in the values below
npm install
npm run dev                    # http://localhost:3000
npm run build                  # production
```

### Environment

| Var | Used for |
| --- | --- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | GitHub login + embedded wallet (dashboard.privy.io) |
| `QUICKNODE_IPFS_KEY` | Pin metadata JSON to IPFS (server-side only) |
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS gateway used to render pinned metadata |
| `NEXT_PUBLIC_SPLITTER_FACTORY` | Deployed `SplitterFactory` address (4663) |
| `NEXT_PUBLIC_RPC_URL` | Robinhood Chain RPC endpoint |

Without `NEXT_PUBLIC_PRIVY_APP_ID` the marketing pages still render; the login
button is disabled.

## License

MIT
