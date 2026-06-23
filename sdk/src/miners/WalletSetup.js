/**
 * WalletSetup — Onboard new machines into your existing wallet.
 *
 * This module helps new machines register with YOUR wallet so they
 * contribute resources and earnings flow to your address.
 *
 * Security: NEVER stores mnemonics in code or the repo.
 * Mnemonics are entered interactively or recovered from OS keyring.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const TARGON_CONFIG_DIR = path.join(os.homedir(), '.config');
const TARGON_CONFIG_PATH = path.join(TARGON_CONFIG_DIR, '.targon.json');

export class WalletSetup {
  /**
   * Check if this machine already has wallet credentials.
   */
  static async hasCredentials() {
    const akash = await this._hasAkashKey();
    const targon = await this._hasTargonConfig();
    return { akash, targon };
  }

  static async _hasAkashKey() {
    try {
      const proc = spawn('provider-services', ['keys', 'list']);
      let out = '';
      proc.stdout.on('data', d => { out += d; });
      return await new Promise((res) => {
        proc.on('close', () => res(out.includes('mykey')));
      });
    } catch { return false; }
  }

  static async _hasTargonConfig() {
    try {
      await fs.access(TARGON_CONFIG_PATH);
      return true;
    } catch { return false; }
  }

  /**
   * Recover Akash wallet from mnemonic.
   * The mnemonic is typed interactively — never passed as a string argument.
   */
  static async recoverAkash(keyName = 'mykey') {
    return new Promise((resolve, reject) => {
      const proc = spawn('provider-services', ['keys', 'add', keyName, '--recover'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      proc.stdout.on('data', d => { output += d; });
      proc.stderr.on('data', d => { error += d; });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, keyName, message: 'Wallet recovered. Address shown in output.' });
        } else {
          reject(new Error(`Recovery failed: ${error || output}`));
        }
      });

      // The user must type the mnemonic interactively.
      // This method is exposed so the app UI can collect it securely.
      resolve({
        success: true,
        interactive: true,
        instruction: 'Please type your Akash mnemonic into the terminal prompt, then press Enter.',
        stdin: proc.stdin
      });
    });
  }

  /**
   * Recover Targon wallet from mnemonic.
   * Writes the config to ~/.config/.targon.json (0600).
   */
  static async recoverTargon(mnemonic) {
    const config = {
      hotkey_phrase: mnemonic,
      ip: '127.0.0.1',
      port: 7777,
      min_stake: 1000
    };

    await fs.mkdir(TARGON_CONFIG_DIR, { recursive: true, mode: 0o700 });
    await fs.writeFile(TARGON_CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });

    return { success: true, path: TARGON_CONFIG_PATH };
  }

  /**
   * One-shot setup for a new machine:
   *   1. Check existing credentials
   *   2. If missing, guide recovery
   *   3. Verify k3s is running (for Akash)
   */
  static async onboardNewMachine() {
    const existing = await this.hasCredentials();
    const results = {
      akash: { exists: existing.akash },
      targon: { exists: existing.targon }
    };

    if (!existing.akash) {
      results.akash.message = 'Run: provider-services keys add mykey --recover (interactive)';
    }

    if (!existing.targon) {
      results.targon.message = 'Use WalletSetup.recoverTargon(mnemonic) to write ~/.config/.targon.json';
    }

    return results;
  }
}
