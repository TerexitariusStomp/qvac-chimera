/**
 * @chimera/sdk — Main entry point
 *
 * Re-exports everything a headless / backend consumer needs:
 *   - ChimeraSDK
 *   - All miner providers
 *   - KeyringManager & WalletSetup utilities
 *
 * React hook: import { useChimera } from '@chimera/sdk/src/useChimera.js'
 */

export { ChimeraSDK } from './ChimeraSDK.js';
export {
  BttAiMinerProvider,
  GolemProvider,
  AnyoneProtocolProvider,
  MysteriumProvider,
  CessProvider,
  EarnidleProvider,
  AkashProvider,
  TargonProvider,
  KeyringManager,
  WalletSetup,
} from './miners/index.js';
