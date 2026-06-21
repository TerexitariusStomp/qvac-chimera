/**
 * PayoutStore — JSON file persistence for payout router data.
 * Stores apps, users, orders, and monthly payout manifests.
 */

import { promises as fs } from 'fs';
import path from 'path';

export class PayoutStore {
  constructor(dataDir = path.join(process.cwd(), 'data', 'payouts')) {
    this.dataDir = dataDir;
    this._files = {
      apps:          path.join(dataDir, 'apps.json'),
      users:         path.join(dataDir, 'users.json'),
      orders:        path.join(dataDir, 'orders.json'),
      payouts:       path.join(dataDir, 'payouts.json'),
      distributions: path.join(dataDir, 'distributions.json'),
      denials:       path.join(dataDir, 'denials.json'),
    };
    this._cache = {};
  }

  async _ensureDir() {
    await fs.mkdir(this.dataDir, { recursive: true });
  }

  async _load(key) {
    if (this._cache[key]) return this._cache[key];
    await this._ensureDir();
    try {
      this._cache[key] = JSON.parse(await fs.readFile(this._files[key], 'utf-8'));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      this._cache[key] = {};
    }
    return this._cache[key];
  }

  async _save(key) {
    await this._ensureDir();
    await fs.writeFile(this._files[key], JSON.stringify(this._cache[key] || {}, null, 2), 'utf-8');
  }

  async getApps() { return this._load('apps'); }
  async getUsers() { return this._load('users'); }
  async getOrders() { return this._load('orders'); }
  async getPayouts() { return this._load('payouts'); }
  async getDistributions() { return this._load('distributions'); }
  async getDenials() { return this._load('denials'); }

  async saveApps() { return this._save('apps'); }
  async saveUsers() { return this._save('users'); }
  async saveOrders() { return this._save('orders'); }
  async savePayouts() { return this._save('payouts'); }
  async saveDistributions() { return this._save('distributions'); }
  async saveDenials() { return this._save('denials'); }
}
