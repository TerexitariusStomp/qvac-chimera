import { Logger } from '../core/Logger.js';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const SESSION_FILE = path.join(process.cwd(), 'data', 'auth.json');

export class AuthService {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('AuthService');
    this.userSession = null;
  }

  async initialize() {
    this.logger.info('Initializing authentication service...');
    try {
      const raw = await fs.readFile(SESSION_FILE, 'utf-8');
      this.userSession = JSON.parse(raw);
      this.logger.info('Loaded existing user session');
    } catch {
      this.logger.info('No existing session found');
    }
    this.logger.info('Authentication service initialized');
  }

  /**
   * Sign in with email + password.
   * On first call (no stored password hash), the provided password becomes
   * the permanent password for this node. Subsequent calls must match it.
   */
  async signIn({ email, password }) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    const stored = await this._loadStoredAuth();

    if (stored && stored.passwordHash) {
      // Existing account — verify password
      const hash = this._hashPassword(password, stored.salt);
      if (hash !== stored.passwordHash) {
        throw new Error('Invalid password');
      }
      this.logger.info(`Sign-in successful for ${email}`);
    } else {
      // First sign-in — create permanent password
      this.logger.info('First sign-in — creating local account');
    }

    const salt = stored?.salt || crypto.randomBytes(16).toString('hex');
    const passwordHash = this._hashPassword(password, salt);
    const sessionToken = crypto.randomBytes(32).toString('base64url');

    this.userSession = {
      token: sessionToken,
      email,
      createdAt: Date.now()
    };

    await this._saveStoredAuth({ email, passwordHash, salt });
    await this._saveSession();

    // Return only the token — never the password hash or salt
    return { token: sessionToken, email };
  }

  async signOut() {
    this.logger.info('Processing sign-out...');
    this.userSession = null;
    try { await fs.unlink(SESSION_FILE); } catch { /* already gone */ }
    this.logger.info('Sign-out successful');
  }

  isAuthenticated() {
    return this.userSession !== null;
  }

  getSession() {
    return this.userSession;
  }

  /** Validate a bearer token against the current session. */
  validateToken(token) {
    if (!this.userSession || !token) return false;
    return this.userSession.token === token;
  }

  _hashPassword(password, salt) {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  async _loadStoredAuth() {
    const authPath = path.join(process.cwd(), 'data', 'auth-store.json');
    try {
      return JSON.parse(await fs.readFile(authPath, 'utf-8'));
    } catch { return null; }
  }

  async _saveStoredAuth(data) {
    const authPath = path.join(process.cwd(), 'data', 'auth-store.json');
    await fs.mkdir(path.dirname(authPath), { recursive: true });
    await fs.writeFile(authPath, JSON.stringify(data, null, 2));
  }

  async _saveSession() {
    if (!this.userSession) return;
    await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
    await fs.writeFile(SESSION_FILE, JSON.stringify(this.userSession, null, 2));
  }
}
