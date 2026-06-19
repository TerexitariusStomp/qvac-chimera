import pkg from 'casper-js-sdk';
const sdk = pkg;
const { PrivateKey, KeyAlgorithm, CLValue, Args, ExecutableDeployItem, DeployHeader, Deploy } = sdk;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';

// Provider private key (the worker)
const PROVIDER_PEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBJLNm8sYi/pVIcbF2soCZTxr9wO3EGtlEtkA2X5bOQvoAcGBSuBBAAK
oUQDQgAE7jl1qDI712D51EeKgfIZ974LmOYjjwkjQ3mHFrpLpL/mbwQ7mz/zmBjf
Rm6VsWCs2wbZAkjyLfzmUUrmzvWIhQ==
-----END EC PRIVATE KEY-----`;

const CONTRACT_HASH = 'a2b36559e7da9f0a3fc10afc23eceb54022ab41649ad976c52802e37ad26700b';

const POLL_INTERVAL_MS = 30000; // 30 seconds
const GAS_PAYMENT = '10000000000';

const providerPk = PrivateKey.fromPem(PROVIDER_PEM, KeyAlgorithm.SECP256K1);
const PROVIDER_HASH = providerPk.publicKey.accountHash().toHex();

let JOBS_DICT = '';
let PENDING_DICT = '';

async function getStateRoot() {
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'chain_get_state_root_hash', params: null })
  });
  return (await res.json()).result?.state_root_hash;
}

async function getNamedKeys() {
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'state_get_entity', params: { entity_identifier: { ContractHash: 'contract-' + CONTRACT_HASH } } })
  });
  return (await res.json()).result?.entity?.Contract?.contract?.named_keys || [];
}

async function queryDict(uref, key) {
  const stateRoot = await getStateRoot();
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'state_get_dictionary_item',
      params: { state_root_hash: stateRoot, dictionary_identifier: { URef: { seed_uref: uref, dictionary_item_key: key } } }
    })
  });
  return (await res.json()).result?.stored_value?.CLValue?.parsed;
}

async function submit(entryPoint, argsMap) {
  const pk = PrivateKey.fromPem(PROVIDER_PEM, KeyAlgorithm.SECP256K1);
  const args = Args.fromMap(argsMap);
  const hashObj = sdk.ContractHash.newContract(CONTRACT_HASH);
  const stored = new sdk.StoredContractByHash(hashObj, entryPoint, args);
  const session = new ExecutableDeployItem();
  session.storedContractByHash = stored;
  const payment = ExecutableDeployItem.standardPayment(GAS_PAYMENT);
  const header = DeployHeader.default();
  header.account = pk.publicKey;
  header.chainName = CHAIN_NAME;
  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(pk);
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'account_put_deploy', params: { deploy: Deploy.toJSON(deploy) } })
  });
  const data = await res.json();
  if (data.error) {
    console.log(`[${entryPoint}] ERROR:`, data.error.message || JSON.stringify(data.error));
    return { hash: '', status: 'ERROR' };
  }
  // Wait for execution
  await new Promise(r => setTimeout(r, 25000));
  const info = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
  }).then(r => r.json());
  const exec = info.result?.execution_info?.execution_result?.Version2;
  const status = exec?.error_message || 'SUCCESS';
  if (status !== 'SUCCESS') {
    console.log(`[${entryPoint}] FAILED:`, status);
  } else {
    console.log(`[${entryPoint}] SUCCESS hash=${data.result.deploy_hash.slice(0,16)}...`);
  }
  return { hash: data.result.deploy_hash, status };
}

async function runInference(jobId, requestHash) {
  console.log(`[inference] Calling real inference API for job ${jobId}...`);
  try {
    const res = await fetch('http://localhost:3002/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: requestHash, job_id: jobId }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    const responseHash = data.output_hash || data.result_hash || data.hash || JSON.stringify(data);
    console.log(`[inference] Done. Response:`, responseHash);
    return responseHash;
  } catch (e) {
    console.error(`[inference] API error: ${e.message}`);
    return `QmError-${Date.now()}`;
  }
}

async function pollAndProcess() {
  try {
    // Initialize dictionary URefs on first run
    if (!JOBS_DICT || !PENDING_DICT) {
      const keys = await getNamedKeys();
      for (const k of keys) {
        if (k.name === 'jobs_dict') JOBS_DICT = k.key;
        if (k.name === 'pending_jobs') PENDING_DICT = k.key;
      }
      if (!JOBS_DICT || !PENDING_DICT) {
        console.log('[poll] Could not find dictionary URefs');
        return;
      }
    }

    const pendingList = await queryDict(PENDING_DICT, 'list') || [];
    if (pendingList.length === 0) {
      console.log('[poll] No pending jobs');
      return;
    }

    console.log(`[poll] ${pendingList.length} job(s) in pending list`);

    for (const jobId of pendingList) {
      // Check if already assigned or beyond pending
      const state = await queryDict(JOBS_DICT, `${jobId}:state`);
      if (state !== 0) {
        console.log(`[poll] Job ${jobId} state=${state}, skipping`);
        continue;
      }

      // Check if we are the designated provider
      const provider = await queryDict(JOBS_DICT, `${jobId}:provider`);
      if (provider !== PROVIDER_HASH) {
        console.log(`[poll] Job ${jobId} provider=${provider}, not us (${PROVIDER_HASH}), skipping`);
        continue;
      }

      console.log(`[poll] Processing job ${jobId}...`);

      // Step 1: Acknowledge
      const ackResult = await submit('provider_ack', { job_id: CLValue.newCLString(jobId) });
      if (ackResult.status !== 'SUCCESS') {
        console.log(`[poll] provider_ack failed for ${jobId}, skipping`);
        continue;
      }

      // Step 2: Run inference (simulated)
      const requestHash = await queryDict(JOBS_DICT, `${jobId}:request_hash`);
      const responseHash = await runInference(jobId, requestHash);

      // Step 3: Submit completion
      const completeResult = await submit('provider_complete', {
        job_id: CLValue.newCLString(jobId),
        response_hash: CLValue.newCLString(responseHash),
      });
      if (completeResult.status !== 'SUCCESS') {
        console.log(`[poll] provider_complete failed for ${jobId}`);
        continue;
      }

      console.log(`[poll] Job ${jobId} fully processed! Waiting for consumer confirmation.`);
    }
  } catch (e) {
    console.error('[poll] Error:', e.message);
  }
}

async function main() {
  console.log('=== Auto-Assign Worker ===');
  console.log('Provider:', PROVIDER_HASH);
  console.log('Contract:', CONTRACT_HASH);
  console.log(`Polling every ${POLL_INTERVAL_MS}ms`);
  console.log('Press Ctrl+C to stop\n');

  // Do an initial poll
  await pollAndProcess();

  // Schedule recurring polls
  setInterval(pollAndProcess, POLL_INTERVAL_MS);
}

main().catch(console.error);
