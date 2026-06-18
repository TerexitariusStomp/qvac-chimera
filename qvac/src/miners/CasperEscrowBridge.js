import { Logger } from '../core/Logger.js';
import pkg from 'casper-js-sdk';

const { PrivateKey, PublicKey, KeyAlgorithm, DeployUtil, RuntimeArgs, CLValue, CLOption, CLU64, CLString, CLByteArray } = pkg;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';

const CONTRACTS = {
  escrowVault: '6482d6e9634eab3258c147facc165223fdc2757113590e9c8d468486849fcbb8',
  computeRegistry: 'f8c969bfa7553a23deab0f77fb43210d4810156a977e0cc2695b23182e5b41d0',
  orderBook: 'cecfc698508213f63e7e7fe6f0729b090af23c87c7e444db7fc90be73736e399',
  reputation: 'fd0bf02161433c13c3070b7d0ea383c976bcbc799413638b4fedc703d4efa1db',
};

const STATE = {
  PENDING: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  PROVIDER_DONE: 3,
  CONSUMER_CONFIRM: 4,
  SETTLED: 5,
  REFUNDED: 6,
  DISPUTED: 7,
  DISPUTE_CONSUMER_WON: 8,
  DISPUTE_PROVIDER_WON: 9,
};

function accountHashToBytes(hashStr) {
  const hex = hashStr.replace('account-hash-', '').replace('hash-', '');
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}

async function stringToHash(str) {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(str).digest('hex');
}

async function rpcCall(method, params) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  return res.json();
}

async function getDictionaryItem(contractHash, dictName, dictKey) {
  const entityRes = await rpcCall('state_get_entity', {
    entity_identifier: { ContractHash: 'contract-' + contractHash },
  });
  const namedKeys = entityRes.result?.entity?.AddressableEntity?.entity?.NamedKeys || [];
  const dictUref = namedKeys.find(k => k.name === dictName)?.key;
  if (!dictUref) return null;

  const stateRoot = await rpcCall('chain_get_state_root_hash', {});
  const stateRootHash = stateRoot.result?.state_root_hash;
  if (!stateRootHash) return null;

  const dictRes = await rpcCall('state_get_dictionary_item', {
    state_root_hash: stateRootHash,
    dictionary_item: {
      Dictionary: dictUref + '/' + dictKey,
    },
  });
  return dictRes.result?.stored_value?.CLValue?.parsed || null;
}

export class CasperEscrowBridge {
  constructor(config, inferenceLayer = null) {
    this.config = config || {};
    this.inferenceLayer = inferenceLayer;
    this.logger = new Logger('CasperEscrowBridge');
    this.isRunning = false;
    this.pollInterval = null;
    this.providerKey = null;
    this.providerAccountHash = null;
    this.processedJobs = new Set();
  }

  async initialize() {
    this.logger.info('Initializing Casper escrow bridge...');

    const pem = this.config.providerKeyPem || process.env.CASPER_PROVIDER_KEY_PEM;
    if (!pem) {
      this.logger.error('No provider private key configured. Set CASPER_PROVIDER_KEY_PEM env var or config.providerKeyPem');
      return;
    }

    this.providerKey = PrivateKey.fromPem(pem, KeyAlgorithm.SECP256K1);
    this.providerAccountHash = this.providerKey.publicKey.accountHash().toHex();
    this.logger.info(`Provider account: ${this.providerAccountHash}`);

    // Check balance
    const balance = await this.getAccountBalance(this.providerAccountHash);
    this.logger.info(`Provider balance: ${balance}`);

    if (balance === '0 CSPR' || balance.startsWith('Error')) {
      this.logger.warn('Provider account has no balance. Fund it with testnet CSPR before accepting jobs.');
    }

    this.logger.info('Casper escrow bridge initialized');
  }

  async getAccountBalance(accountHashStr) {
    try {
      const entityRes = await rpcCall('state_get_entity', {
        entity_identifier: { AccountHash: 'account-hash-' + accountHashStr },
      });
      const mainPurse = entityRes.result?.entity?.AddressableEntity?.entity?.Account?.main_purse;
      if (!mainPurse) return '0 CSPR';

      const balanceRes = await rpcCall('query_balance', {
        purse_identifier: { main_purse_under_account_hash: 'account-hash-' + accountHashStr },
      });
      const balanceValue = balanceRes.result?.balance || '0';
      return (Number(balanceValue) / 1e9).toFixed(4) + ' CSPR';
    } catch (e) {
      return 'Error: ' + e.message;
    }
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.logger.info('Starting Casper escrow bridge polling...');

    // Poll immediately, then every 15 seconds
    await this.pollJobs();
    this.pollInterval = setInterval(() => this.pollJobs(), 15000);
  }

  async stop() {
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.logger.info('Casper escrow bridge stopped');
  }

  async pollJobs() {
    if (!this.isRunning) return;

    try {
      // Get pending jobs list
      const pending = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_pending_jobs', 'list');
      if (!pending || !Array.isArray(pending) || pending.length === 0) return;

      this.logger.info(`Found ${pending.length} pending job(s)`);

      for (const jobId of pending) {
        if (this.processedJobs.has(jobId)) continue;
        await this.handleJob(jobId);
      }
    } catch (e) {
      this.logger.error(`Poll error: ${e.message}`);
    }
  }

  async handleJob(jobId) {
    try {
      // Read job state directly from dictionary
      const stateVal = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_jobs', `${jobId}:state`);
      const providerVal = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_jobs', `${jobId}:provider`);
      const consumerVal = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_jobs', `${jobId}:consumer`);
      const amountVal = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_jobs', `${jobId}:amount`);

      if (stateVal === null || providerVal === null) {
        this.logger.warn(`Could not fetch job details for ${jobId}`);
        return;
      }

      // providerVal and consumerVal are AccountHash bytes, convert to hex
      const providerHex = Buffer.from(providerVal).toString('hex');
      const state = Number(stateVal);
      const consumerHex = consumerVal ? Buffer.from(consumerVal).toString('hex') : '';

      this.logger.info(`Job ${jobId}: state=${state}, provider=${providerHex.slice(0,16)}..., consumer=${consumerHex.slice(0,16)}..., amount=${amountVal}`);

      // Only handle jobs assigned to us in pending state
      if (providerHex !== this.providerAccountHash) {
        this.logger.debug(`Job ${jobId} not assigned to us`);
        return;
      }

      if (state !== STATE.PENDING) {
        this.logger.debug(`Job ${jobId} not pending (state=${state})`);
        return;
      }

      this.logger.info(`Accepting job ${jobId}...`);
      await this.providerAck(jobId);

      // Get the request hash (order_id/prompt)
      const requestHash = await getDictionaryItem(CONTRACTS.escrowVault, 'ev2_jobs', `${jobId}:request_hash`);
      this.logger.info(`Job ${jobId} request: ${requestHash}`);

      // Run inference
      const inferenceResult = await this.runInference(requestHash || jobId);

      // Compute response hash
      const responseHash = await stringToHash(JSON.stringify(inferenceResult));
      this.logger.info(`Job ${jobId} response hash: ${responseHash}`);

      // Complete job
      await this.providerComplete(jobId, responseHash);
      this.logger.info(`Job ${jobId} completed, awaiting consumer confirmation...`);

      // Mark as processed so we don't re-process
      this.processedJobs.add(jobId);

      // Start monitoring for settlement
      this.monitorJobSettlement(jobId);

    } catch (e) {
      this.logger.error(`Failed to handle job ${jobId}: ${e.message}`);
    }
  }

  async runInference(prompt) {
    if (!this.inferenceLayer) {
      this.logger.warn('No inference layer available, returning mock result');
      return { output: `Mock inference for: ${prompt}`, tokensGenerated: 0, durationMs: 0, fallback: true };
    }

    this.logger.info(`Routing inference request: "${String(prompt).slice(0, 80)}..."`);

    try {
      const result = await this.inferenceLayer.handleInferenceRequest({
        prompt: String(prompt),
        maxTokens: 512,
        temperature: 0.7,
        source: 'casper-escrow',
      });

      this.logger.info(`Inference completed: ${result.success ? 'success' : 'failed'}`);
      return result;
    } catch (e) {
      this.logger.error(`Inference error: ${e.message}`);
      return { output: `Error: ${e.message}`, tokensGenerated: 0, durationMs: 0, fallback: true };
    }
  }

  async computeHash(str) {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(str).digest('hex');
  }

  async monitorJobSettlement(jobId) {
    let attempts = 0;
    const maxAttempts = 40; // ~10 minutes at 15s interval

    const check = async () => {
      if (!this.isRunning) return;
      attempts++;

      try {
        const jobStr = await this.callEntryPointRead(CONTRACTS.escrowVault, 'get_job', { job_id: jobId });
        if (!jobStr) return;

        const params = new URLSearchParams(jobStr);
        const state = params.get('state') || '';

        this.logger.info(`Job ${jobId} monitor: state=${state} (attempt ${attempts})`);

        if (state === 'settled' || state === 'consumer_confirm') {
          await this.claimPayment(jobId);
          return;
        }

        if (state === 'refunded') {
          this.logger.warn(`Job ${jobId} was refunded`);
          return;
        }

        if (state === 'disputed') {
          this.logger.warn(`Job ${jobId} is disputed`);
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(check, 15000);
        } else {
          this.logger.warn(`Job ${jobId} settlement timeout`);
        }
      } catch (e) {
        this.logger.error(`Monitor error for ${jobId}: ${e.message}`);
        if (attempts < maxAttempts) setTimeout(check, 15000);
      }
    };

    setTimeout(check, 15000);
  }

  // --- Transaction helpers ---

  async providerAck(jobId) {
    await this.sendDeploy(CONTRACTS.escrowVault, 'provider_ack', {
      job_id: CLValue.newCLString(jobId),
    });
    this.logger.info(`provider_ack sent for ${jobId}`);
  }

  async providerComplete(jobId, responseHash) {
    await this.sendDeploy(CONTRACTS.escrowVault, 'provider_complete', {
      job_id: CLValue.newCLString(jobId),
      response_hash: CLValue.newCLString(responseHash),
    });
    this.logger.info(`provider_complete sent for ${jobId}`);
  }

  async claimPayment(jobId) {
    await this.sendDeploy(CONTRACTS.escrowVault, 'claim_payment', {
      job_id: CLValue.newCLString(jobId),
    });
    this.logger.info(`claim_payment sent for ${jobId}`);
  }

  async sendDeploy(contractHash, entryPoint, argsMap) {
    const publicKey = this.providerKey.publicKey;
    const deploy = this.buildDeploy(publicKey, contractHash, entryPoint, argsMap);
    deploy.sign(this.providerKey);

    const deployJson = DeployUtil.deployToJson(deploy);
    const res = await rpcCall('account_put_deploy', { deploy: deployJson.deploy });

    if (res.error) {
      throw new Error(`Deploy failed: ${res.error.message}`);
    }

    this.logger.info(`Deploy ${entryPoint} submitted: ${res.result?.deploy_hash || 'unknown'}`);
    return res.result?.deploy_hash;
  }

  buildDeploy(publicKey, contractHash, entryPoint, argsMap, payment = '10000000000') {
    const runtimeArgs = RuntimeArgs.fromMap(argsMap);
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(
        publicKey,
        CHAIN_NAME,
        1,
        1800000
      ),
      DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        Uint8Array.from(Buffer.from(contractHash, 'hex')),
        entryPoint,
        runtimeArgs
      ),
      DeployUtil.standardPayment(payment)
    );
    return deploy;
  }

  async callEntryPointRead(contractHash, entryPoint, args) {
    // get_job returns data via runtime::ret, which requires a deploy
    // For read-only queries we can use dictionary reads instead
    // This is a simplified version - for get_job we parse dictionaries
    return null;
  }

  getStatus() {
    return {
      running: this.isRunning,
      providerAccount: this.providerAccountHash,
      processedJobs: this.processedJobs.size,
    };
  }
}
