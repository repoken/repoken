/**
 * PONS launch studio integration (Robinhood Chain).
 *
 * Tokens are launched through the PONS studio entrypoint using the proven
 * launch(...) selector. This deploys a standard ERC-20 and lists it on
 * Uniswap V3 via PONS — no custom factory to deploy.
 *
 * ABI (verified byte-for-byte against real launches):
 *   launch(
 *     (string name, string symbol, string logo, string description,
 *      (string twitter, string telegram, string discord, string website, string farcaster) socials,
 *      address feeWallet, uint256 taxBps, uint256 f8, bytes32 f9, bytes32 f10) meta,
 *     uint256 p1,
 *     address pairToken,       // 0x0 => pair against ETH
 *     uint256 devBuy,          // wei of ETH to buy at launch
 *     uint256 minOut,          // slippage floor (0 = accept any)
 *     address creator,
 *     address[] recipients     // optional bundle wallets
 *   )
 */
import {
  encodeAbiParameters,
  parseAbiParameters,
  parseEther,
  type AbiParameter,
  type Address,
  type Hex,
  type TransactionReceipt,
} from 'viem';

/** PONS launch studio entrypoint on Robinhood Chain. */
export const PONS_STUDIO = '0xe33e9e479df8802cb0866d5d05258bec4cf62948' as Address;
/** launch(...) function selector. */
export const PONS_LAUNCH_SELECTOR = '0xf85f8e41';
/** Platform launch fee enforced by the studio. */
export const PONS_LAUNCH_FEE = parseEther('0.0005');

/**
 * Repoken launch tax: 2% total, routed to a per-creator FeeSplitter that pays
 * 1% to the Repoken treasury (buyback + burn) and 1% to the launching creator.
 */
export const REPOKEN_TAX_BPS = 200n;

/**
 * The studio reverts when devBuy == 0 (verified via eth_call). Real zero-buy
 * launches on-chain send 2 wei, so a "no dev buy" launch uses this floor.
 */
export const PONS_MIN_DEV_BUY_WEI = 2n;

function devBuyWei(devBuyEth?: string): bigint {
  const wei = parseEther(devBuyEth ?? '0');
  return wei < PONS_MIN_DEV_BUY_WEI ? PONS_MIN_DEV_BUY_WEI : wei;
}

const ZERO32 = ('0x' + '00'.repeat(32)) as Hex;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
/** ERC-20 Transfer(address,address,uint256) topic0. */
const TRANSFER_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

const LAUNCH_PARAMS = parseAbiParameters(
  '(string,string,string,string,(string,string,string,string,string),address,uint256,uint256,bytes32,bytes32), uint256, address, uint256, uint256, address, address[]',
) as unknown as readonly AbiParameter[];

export interface PonsSocials {
  twitter?: string;
  telegram?: string;
  discord?: string;
  website?: string;
  farcaster?: string;
}

export interface PonsLaunchParams {
  name: string;
  symbol: string;
  /** Image URL or ipfs:// URI shown on the PONS card. */
  logo: string;
  description: string;
  socials: PonsSocials;
  /** The launching wallet (recorded as PONS creator). */
  creator: Address;
  /** Wallet that receives the tax. Defaults to `creator` if omitted. */
  feeWallet?: Address;
  /** Tax in basis points routed to the fee wallet. Default 0 (no tax). */
  taxBps?: bigint;
  /** ETH amount to buy at launch, as a human string. Default "0". */
  devBuyEth?: string;
  /** Pair token; defaults to ETH. */
  pairToken?: Address;
  /** Minimum tokens out (slippage floor). Default 0n. */
  minOut?: bigint;
}

/** Encode the studio launch(...) calldata for a token. */
export function buildPonsLaunchCalldata(p: PonsLaunchParams): Hex {
  const socials = [
    p.socials.twitter ?? '',
    p.socials.telegram ?? '',
    p.socials.discord ?? '',
    p.socials.website ?? '',
    p.socials.farcaster ?? '',
  ];
  const meta = [
    p.name,
    p.symbol,
    p.logo,
    p.description,
    socials,
    p.feeWallet ?? p.creator, // feeWallet -> tax goes here (splitter)
    p.taxBps ?? 0n,
    0n, // f8 flag
    ZERO32, // f9: no studio signature (permissionless path)
    ZERO32, // f10
  ];
  const encoded = encodeAbiParameters(LAUNCH_PARAMS, [
    meta,
    0n, // p1 (always 0 in observed launches)
    p.pairToken ?? ZERO_ADDRESS,
    devBuyWei(p.devBuyEth),
    p.minOut ?? 0n,
    p.creator,
    [], // recipients bundle (none)
  ] as unknown[]);
  return (PONS_LAUNCH_SELECTOR + encoded.slice(2)) as Hex;
}

/** msg.value required = dev buy + platform launch fee. */
export function ponsLaunchValue(devBuyEth?: string): bigint {
  return devBuyWei(devBuyEth) + PONS_LAUNCH_FEE;
}

/**
 * Extract the launched token address from a receipt by finding the mint
 * Transfer(from=0x0) log; its emitter is the new token contract.
 */
export function extractLaunchedToken(receipt: TransactionReceipt): Address | '' {
  for (const log of receipt.logs) {
    if (log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) continue;
    const from = log.topics[1];
    if (from && /^0x0+$/.test(from.slice(2))) {
      return log.address as Address;
    }
  }
  // fallback: first Transfer emitter
  const anyTransfer = receipt.logs.find(
    (l) => l.topics[0]?.toLowerCase() === TRANSFER_TOPIC,
  );
  return anyTransfer ? (anyTransfer.address as Address) : '';
}
