import type { Address } from 'viem';

/** Address of the deployed PonsTokenFactory on Robinhood Chain. */
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS ??
  '0x0000000000000000000000000000000000000000') as Address;

/**
 * SplitterFactory on Robinhood Chain. Deploys one FeeSplitter per creator that
 * routes the PONS launch tax 50/50 — half to the Repoken treasury (buyback +
 * burn) and half to the creator that launched the token.
 */
export const SPLITTER_FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_SPLITTER_FACTORY ??
  '0x0000000000000000000000000000000000000000') as Address;

/** ABI subset for SplitterFactory. */
export const splitterFactoryAbi = [
  {
    type: 'function',
    name: 'ensureSplitter',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: 'splitter', type: 'address' }],
  },
  {
    type: 'function',
    name: 'predict',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'isDeployed',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'treasury',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/** ABI subset needed by the frontend — mirrors contracts/src/PonsTokenFactory.sol. */
export const ponsFactoryAbi = [
  {
    type: 'function',
    name: 'launchToken',
    stateMutability: 'payable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'githubRepo', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'initialSupply', type: 'uint256' },
    ],
    outputs: [{ name: 'token', type: 'address' }],
  },
  {
    type: 'function',
    name: 'launchFee',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenByRepo',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'function',
    name: 'totalTokens',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'tokenInfo',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'token', type: 'address' },
      { name: 'creator', type: 'address' },
      { name: 'githubRepo', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'initialSupply', type: 'uint256' },
      { name: 'launchedAt', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getTokens',
    stateMutability: 'view',
    inputs: [
      { name: 'offset', type: 'uint256' },
      { name: 'limit', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'page',
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'githubRepo', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'initialSupply', type: 'uint256' },
          { name: 'launchedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'event',
    name: 'TokenLaunched',
    inputs: [
      { name: 'token', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'githubRepo', type: 'string', indexed: false },
      { name: 'name', type: 'string', indexed: false },
      { name: 'symbol', type: 'string', indexed: false },
      { name: 'metadataURI', type: 'string', indexed: false },
      { name: 'initialSupply', type: 'uint256', indexed: false },
    ],
  },
] as const;

/** Minimal ERC-20 + RepoToken metadata reads for the token detail page. */
export const repoTokenAbi = [
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'githubRepo', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'metadataURI', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'creator', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;
