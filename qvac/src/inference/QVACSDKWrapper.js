import { Logger } from '../core/Logger.js';

let sdk = null;
let loadModelFn = null;
let completionFn = null;
let unloadModelFn = null;
let LLAMA_MODEL = null;

async function ensureSDK() {
  if (sdk) return sdk;
  try {
    const module = await import('@qvac/sdk');
    loadModelFn = module.loadModel;
    completionFn = module.completion;
    unloadModelFn = module.unloadModel;
    LLAMA_MODEL = module.LLAMA_3_2_1B_INST_Q4_0;
    sdk = module;
    return module;
  } catch (err) {
    throw new Error(`Failed to load @qvac/sdk: ${err.message}`);
  }
}

export class QVACSDKWrapper {
  constructor(config = {}) {
    this.config = config;
    this.logger = new Logger('QVACSDK');
    this.modelId = null;
    this.modelLoaded = false;
    this.modelSrc = config.modelSrc || LLAMA_MODEL;
  }

  async initialize() {
    await ensureSDK();
    this.logger.info('QVAC SDK wrapper initialized');
  }

  async loadModel() {
    if (!loadModelFn) await ensureSDK();
    if (this.modelLoaded) return this.modelId;

    const modelSrc = this.modelSrc || LLAMA_MODEL;
    if (!modelSrc) {
      this.logger.warn('No model source configured, using default LLAMA_3_2_1B_INST_Q4_0');
    }

    this.logger.info('Loading QVAC model...');
    this.modelId = await loadModelFn({
      modelSrc,
      onProgress: (progress) => {
        this.logger.debug(`Model load progress: ${Math.round(progress * 100)}%`);
      }
    });
    this.modelLoaded = true;
    this.logger.info(`Model loaded: ${this.modelId}`);
    return this.modelId;
  }

  async generate(prompt, options = {}) {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    const history = [
      { role: 'user', content: prompt }
    ];

    const maxTokens = options.maxTokens || 256;
    const temperature = options.temperature || 0.7;

    this.logger.info(`Running QVAC inference: "${prompt.slice(0, 50)}..."`);
    const startTime = Date.now();

    const result = await completionFn({
      modelId: this.modelId,
      history,
      maxTokens,
      temperature,
      stream: false
    });

    const duration = Date.now() - startTime;
    const output = result.text || result.content || '';
    const tokens = result.tokensGenerated || result.tokens || Math.ceil(output.length / 4);

    this.logger.info(`QVAC inference complete: ${tokens} tokens in ${duration}ms`);

    return {
      output,
      tokensGenerated: tokens,
      durationMs: duration,
      model: this.modelId
    };
  }

  async unload() {
    if (!this.modelLoaded || !this.modelId) return;
    await unloadModelFn({ modelId: this.modelId });
    this.modelLoaded = false;
    this.modelId = null;
    this.logger.info('Model unloaded');
  }

  getStatus() {
    return {
      sdkLoaded: !!sdk,
      modelLoaded: this.modelLoaded,
      modelId: this.modelId
    };
  }
}
