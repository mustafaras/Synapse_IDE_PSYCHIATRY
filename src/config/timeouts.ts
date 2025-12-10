import { flags } from './flags';


const PROD = {
  idleMs: 25_000,
  hardMs: 120_000,
  retryBackoffMs: 800,
  sseOpenMs: 10_000,
};

const E2E = {
  idleMs: 1_200,
  hardMs: 6_000,
  retryBackoffMs: 100,
  sseOpenMs: 1_000,
};


export const timeouts = flags.e2e ? E2E : PROD;
export type Timeouts = typeof timeouts;
