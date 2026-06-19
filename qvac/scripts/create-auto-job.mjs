import pkg from 'casper-js-sdk';
const sdk = pkg;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';
const CONTRACT_HASH = 'a2b36559e7da9f0a3fc10afc23eceb54022ab41649ad976c52802e37ad26700b';
const CONTRACT_PURSE = 'uref-6ec52bb818122d4c5a38609b7e4cc4e324d0e6f2350ef3216325bc3a5e23e3f1-007';
const ROUTER_PROVIDER = 'f227d4fb7c50164d363c5461ad0044ef8f3b8ad5ee7072b87384e101a2a4263d';

const CONSUMER_PEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIA6Hjhvhzz4rc5cKlR3fOtI42H8E1VOqpdpe6P/Nc7qvoAcGBSuBBAAK
oUQDQgAEJ9jdXMqmAORbNuWY2Q74wmtsZ++Bvf696PpYOZepHqWCFmTFZDzW+JYO
fZf7vQid4otudHLFJBWkiazcayJz9g==
-----END EC PRIVATE KEY-----`;

function hexToBytes(hex) {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

async function nativeTransfer(pem, amount, targetPurse) {
  const pk = sdk.PrivateKey.fromPem(pem, sdk.KeyAlgorithm.SECP256K1);
  const item = sdk.TransferDeployItem.newTransfer(amount, sdk.URef.fromString(targetPurse));
  const payment = sdk.ExecutableDeployItem.standardPayment('100000000');
  const header = sdk.DeployHeader.default();
  header.account = pk.publicKey;
  header.chainName = CHAIN_NAME;
  const session = new sdk.ExecutableDeployItem();
  session.transfer = item;
  const deploy = sdk.Deploy.makeDeploy(header, payment, session);
  deploy.sign(pk);
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'account_put_deploy', params: { deploy: sdk.Deploy.toJSON(deploy) } })
  });
  const data = await res.json();
  if (data.error) { console.log('Transfer ERROR:', data.error); return false; }
  await new Promise(r => setTimeout(r, 25000));
  const info = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
  }).then(r => r.json());
  const exec = info.result?.execution_info?.execution_result?.Version2;
  console.log('Transfer:', exec?.error_message || 'SUCCESS');
  return !exec?.error_message;
}

async function submit(pem, entryPoint, argsMap) {
  const pk = sdk.PrivateKey.fromPem(pem, sdk.KeyAlgorithm.SECP256K1);
  const args = sdk.Args.fromMap(argsMap);
  const hashObj = sdk.ContractHash.newContract(CONTRACT_HASH);
  const stored = new sdk.StoredContractByHash(hashObj, entryPoint, args);
  const session = new sdk.ExecutableDeployItem();
  session.storedContractByHash = stored;
  const payment = sdk.ExecutableDeployItem.standardPayment('10000000000');
  const header = sdk.DeployHeader.default();
  header.account = pk.publicKey;
  header.chainName = CHAIN_NAME;
  const deploy = sdk.Deploy.makeDeploy(header, payment, session);
  deploy.sign(pk);
  const res = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'account_put_deploy', params: { deploy: sdk.Deploy.toJSON(deploy) } })
  });
  const data = await res.json();
  if (data.error) return { hash: '', status: 'ERROR: ' + JSON.stringify(data.error) };
  await new Promise(r => setTimeout(r, 25000));
  const info = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
  }).then(r => r.json());
  const exec = info.result?.execution_info?.execution_result?.Version2;
  const status = exec?.error_message || 'SUCCESS';
  console.log(`${entryPoint}:`, status);
  return { hash: data.result.deploy_hash, status };
}

async function main() {
  const consumerKey = sdk.PrivateKey.fromPem(CONSUMER_PEM, sdk.KeyAlgorithm.SECP256K1);
  const consumerHash = consumerKey.publicKey.accountHash().toHex();
  const prompt = process.argv[2] || 'What is machine learning?';
  const amount = process.argv[3] || '2500000000';

  console.log('=== Create Auto-Routed Job ===');
  console.log('Consumer:', consumerHash);
  console.log('Provider (router):', ROUTER_PROVIDER);
  console.log('Prompt:', prompt);
  console.log('Amount:', amount, 'motes');

  // Step 1: Deposit to escrow
  console.log('\n--- Depositing to escrow ---');
  await nativeTransfer(CONSUMER_PEM, amount, CONTRACT_PURSE);

  // Step 2: Create job with router as provider
  console.log('--- Creating job ---');
  const r = await submit(CONSUMER_PEM, 'create_job', {
    consumer: sdk.CLValue.newCLByteArray(hexToBytes(consumerHash)),
    provider: sdk.CLValue.newCLByteArray(hexToBytes(ROUTER_PROVIDER)),
    amount: sdk.CLValue.newCLUInt512(amount),
    provider_fee_bps: sdk.CLValue.newCLUint64('100'),
    order_id: sdk.CLValue.newCLString(prompt),
  });

  if (r.status === 'SUCCESS') {
    console.log('\nJob created! Router will auto-pickup within 15 seconds.');
    console.log('Check /tmp/router.log for progress.');
  }
}

main().catch(console.error);
