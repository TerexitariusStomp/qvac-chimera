/**
 * EarnidleProvider — IDLE Inference Network worker.
 *
 * Polls api.earnidle.com for inference jobs, runs them via the QVAC
 * inference layer (@qvac/sdk), and submits results for USDC payout.
 *
 * Security: uses only a public Solana wallet address for payouts.
 * No private keys are stored or transmitted. Safe for untrusted machines.
 */

import { Logger } from '../../../qvac/src/core/Logger.js';

export class EarnidleProvider {
  constructor(opts = {}) {
    this.name = 'earnidle';
    this.logger = new Logger('EarnidleProvider');
    this.running = false;
    this.walletAddress = opts.walletAddress || null;
    this.network = opts.network || 'solana';
    this.apiBase = opts.apiBase || 'https://api.earnidle.com';
    this.model = opts.model || 'llama-3.2-1b-instruct';
    this.nodeName = opts.nodeName || 'Chimera-SDK-Node';
    this.gpuAvailable = opts.gpuAvailable || false;
    this.pollInterval = opts.pollInterval || 30000;
    this.inferenceLayer = opts.inferenceLayer || null;

    this.jobsCompleted = 0;
    this.jobsFailed = 0;
    this.totalTokens = 0;
    this.earningsUSDC = 0;
    this._pollTimer = null;
    this._pollCount = 0;
  }

  async init() {
    if (this.walletAddress) {
      if (!this._validateWalletAddress(this.walletAddress)) {
        throw new Error('Invalid Solana wallet address format');
      }
      this.logger.info(`Payout wallet: ${this._maskAddress(this.walletAddress)}`);
    } else {
      this.logger.warn('No wallet configured — payouts disabled');
    }

    this.logger.info(`Model: ${this.model} | GPU: ${this.gpuAvailable}`);
  }

  _validateWalletAddress(addr) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
  }

  _maskAddress(addr) {
    if (!addr || addr.length < 10) return '***';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  async start() {
    if (this.running) return { success: true, alreadyRunning: true };
    this.logger.info('Starting IDLE inference worker...');
    this.running = true;
    this._runLoop();
    return { success: true, provider: 'earnidle' };
  }

  async stop() {
    if (!this.running) return { success: true, alreadyStopped: true };
    this.logger.info('Stopping IDLE inference worker...');
    this.running = false;
    if (this._pollTimer) clearTimeout(this._pollTimer);
    this._pollTimer = null;
    return { success: true, provider: 'earnidle' };
  }

  async _runLoop() {
    while (this.running) {
      try {
        await this._pollAndRun();
      } catch (e) {
        this.logger.error(`Polling error: ${e.message}`);
      }
      this._pollCount++;
      if (this._pollCount % 10 === 0) {
        this.logger.info(`IDLE heartbeat: ${this._pollCount} polls, ${this.jobsCompleted} jobs, ${this.earningsUSDC.toFixed(4)} USDC`);
      }
      await this._sleep(this.pollInterval);
    }
  }

  _sleep(ms) {
    return new Promise(resolve => { this._pollTimer = setTimeout(resolve, ms).unref(); });
  }

  async _pollAndRun() {
    if (!this.walletAddress) return;

    const pollUrl = `${this.apiBase}/api/inference/job?` +
      `node_id=${encodeURIComponent(this.walletAddress)}&` +
      `model=${encodeURIComponent(this.model)}`;

    let job = null;
    try {
      const res = await fetch(pollUrl, { headers: { 'Accept': 'application/json' } });
      if (res.status === 204) return;
      if (res.status === 404) {
        this.logger.warn(`IDLE poll: endpoint not found (404) — check apiBase config`);
        return;
      }
      if (!res.ok) {
        this.logger.warn(`IDLE poll: HTTP ${res.status}`);
        return;
      }
      job = await res.json();
    } catch (e) {
      this.logger.debug(`IDLE poll: network error (${e.message})`);
      return;
    }

    if (!job || !job.id) return;

    this.logger.info(`Job ${job.id.slice(0, 8)}… received | prompt: ${(job.prompt || '').slice(0, 60)}…`);

    const result = await this._runInference(job);
    await this._submitResult(job.id, result);
  }

  async _runInference(job) {
    const prompt = job.prompt || job.messages?.map(m => m.content).join('\n') || '';
    const maxTokens = job.max_tokens || 256;
    const temperature = job.temperature || 0.7;

    try {
      if (this.inferenceLayer) {
        this.logger.info('Routing through QVAC inference layer');
        const out = await this.inferenceLayer.handleInferenceRequest({
          model: this.model,
          prompt,
          maxTokens,
          temperature,
          stream: false,
          source: 'earnidle'
        });
        return {
          success: out.success,
          text: out.output || out.text || '',
          tokens: out.tokensGenerated || maxTokens
        };
      }

      this.logger.info('Using direct QVAC SDK inference');
      const qvac = await import('@qvac/sdk');
      const modelId = await qvac.loadModel({
        modelSrc: qvac.LLAMA_3_2_1B_INST_Q4_0,
        modelType: 'text',
        modelConfig: { device: 'cpu' }
      });
      const out = await qvac.completion({
        modelId,
        history: [{ role: 'user', content: prompt }],
        stream: false,
        generationParams: { predict: maxTokens, temp: temperature }
      });
      let text = '';
      for await (const token of out.tokenStream) { text += token; }
      return { success: true, text, tokens: maxTokens };
    } catch (e) {
      this.logger.error(`Inference failed: ${e.message}`);
      return { success: false, error: e.message, text: '', tokens: 0 };
    }
  }

  async _submitResult(jobId, result) {
    const submitUrl = `${this.apiBase}/api/inference/result`;
    const payload = {
      node_id: this.walletAddress,
      job_id: jobId,
      model: this.model,
      output: result.text || '',
      tokens: result.tokens || 0,
      success: result.success
    };

    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        this.jobsCompleted++;
        this.totalTokens += result.tokens || 0;
        this.earningsUSDC += data.usdcEarned || 0;
        this.logger.info(`Result submitted | earned ${data.usdcEarned || 0} USDC | total: ${this.earningsUSDC.toFixed(4)}`);
      } else {
        this.jobsFailed++;
        const text = await res.text();
        this.logger.warn(`Submit failed ${res.status}: ${text}`);
      }
    } catch (e) {
      this.jobsFailed++;
      this.logger.error(`Submit error: ${e.message}`);
    }
  }

  status() {
    return {
      provider: 'earnidle',
      running: this.running,
      walletConfigured: !!this.walletAddress,
      walletAddress: this._maskAddress(this.walletAddress),
      network: this.network,
      model: this.model,
      gpuAvailable: this.gpuAvailable,
      jobsCompleted: this.jobsCompleted,
      jobsFailed: this.jobsFailed,
      totalTokens: this.totalTokens,
      earningsUSDC: this.earningsUSDC
    };
  }
}
