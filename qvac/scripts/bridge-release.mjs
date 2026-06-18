import { readFileSync } from 'fs';
import pkg from 'casper-js-sdk';
const sdk = pkg;
const { PrivateKey, KeyAlgorithm, CLValue, Args, DeployHeader, ExecutableDeployItem, Deploy } = sdk;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';
const ESCROW_PEM_PATH = '/tmp/escrow-account.pem';
const TRANSFER_WASM_PATH = '/tmp/transfer_session.wasm';

const CONTRACT_HASH = 'b3f8b9643cc190448139525491b3196df072e30c703610261336bb97202b5e27';

function hexToBytes(hex) {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function sendDeploy(deploy) {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'account_put_deploy',
      params: { deploy: Deploy.toJSON(deploy) }
    })
  });
  return await res.json();
}

async function waitForDeploy(deployHash) {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'info_get_deploy',
        params: { deploy_hash: deployHash }
      })
    });
    const data = await res.json();
    const execution_result = data.result?.execution_info?.execution_result;
    if (execution_result?.Version2) {
      return execution_result.Version2;
    }
  }
  return null;
}

async function transferToProvider(providerAccountHash, amount) {
  const privateKey = PrivateKey.fromPem(readFileSync(ESCROW_PEM_PATH, 'utf8'), KeyAlgorithm.SECP256K1);
  const publicKey = privateKey.publicKey;

  const wasmBytes = readFileSync(TRANSFER_WASM_PATH);
  const args = Args.fromMap({
    target: CLValue.newCLByteArray(hexToBytes(providerAccountHash)),
    amount: CLValue.newCLUInt512(amount),
  });

  const session = ExecutableDeployItem.newModuleBytes(wasmBytes, args);
  const payment = ExecutableDeployItem.standardPayment('10000000000');
  const header = DeployHeader.default();
  header.account = publicKey;
  header.chainName = CHAIN_NAME;
  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(privateKey);

  console.log('Submitting transfer to provider:', providerAccountHash, 'amount:', amount);
  const result = await sendDeploy(deploy);
  if (result.error) {
    console.error('Transfer deploy failed:', result.error);
    return null;
  }
  console.log('Transfer deploy hash:', result.result.deploy_hash);

  const v2 = await waitForDeploy(result.result.deploy_hash);
  console.log('Transfer error_message:', v2?.error_message);
  console.log('Transfer consumed:', v2?.consumed);
  return { deployHash: result.result.deploy_hash, error: v2?.error_message };
}

async function markReleased(jobId, providerPayout) {
  const privateKey = PrivateKey.fromPem(readFileSync(ESCROW_PEM_PATH, 'utf8'), KeyAlgorithm.SECP256K1);
  const publicKey = privateKey.publicKey;

  const argsMap = {
    job_id: CLValue.newCLString(jobId),
    provider_payout: CLValue.newCLUInt512(providerPayout),
  };
  const args = Args.fromMap(argsMap);
  const contractHashObj = sdk.ContractHash.newContract(CONTRACT_HASH);
  const storedContract = new sdk.StoredContractByHash(contractHashObj, 'mark_released', args);
  const session = new ExecutableDeployItem();
  session.storedContractByHash = storedContract;
  const payment = ExecutableDeployItem.standardPayment('10000000000');
  const header = DeployHeader.default();
  header.account = publicKey;
  header.chainName = CHAIN_NAME;
  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(privateKey);

  console.log('Submitting mark_released for job:', jobId, 'payout:', providerPayout);
  const result = await sendDeploy(deploy);
  if (result.error) {
    console.error('mark_released deploy failed:', result.error);
    return null;
  }
  console.log('mark_released deploy hash:', result.result.deploy_hash);

  const v2 = await waitForDeploy(result.result.deploy_hash);
  console.log('mark_released error_message:', v2?.error_message);
  return { deployHash: result.result.deploy_hash, error: v2?.error_message };
}

async function main() {
  const jobId = process.argv[2];
  const providerAccount = process.argv[3];
  const payout = process.argv[4];

  if (!jobId || !providerAccount || !payout) {
    console.error('Usage: node bridge-release.mjs <job_id> <provider_account_hash> <payout_amount>');
    console.error('  Example: node bridge-release.mjs job:e39a...:0 f227d4fb... 900');
    process.exit(1);
  }

  console.log('========================================');
  console.log('Bridge Release (server-side only)');
  console.log('Job ID:', jobId);
  console.log('Provider:', providerAccount);
  console.log('Payout:', payout);
  console.log('Contract:', CONTRACT_HASH);
  console.log('========================================');

  // Step 1: Transfer funds from escrow to provider via session code
  const transferResult = await transferToProvider(providerAccount, payout);
  if (transferResult?.error) {
    console.error('Transfer failed, aborting mark_released');
    process.exit(1);
  }

  // Step 2: Mark job as released on contract
  const releaseResult = await markReleased(jobId, payout);
  if (releaseResult?.error) {
    console.error('mark_released failed');
    process.exit(1);
  }

  console.log('Release complete!');
}

main().catch(console.error);
