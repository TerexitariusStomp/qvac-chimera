import pkg from 'casper-js-sdk';
const sdk = pkg;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';
const CONTRACT_HASH = 'a2b36559e7da9f0a3fc10afc23eceb54022ab41649ad976c52802e37ad26700b';

const PROVIDER_PEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIBJLNm8sYi/pVIcbF2soCZTxr9wO3EGtlEtkA2X5bOQvoAcGBSuBBAAK
oUQDQgAE7jl1qDI712D51EeKgfIZ974LmOYjjwkjQ3mHFrpLpL/mbwQ7mz/zmBjf
Rm6VsWCs2wbZAkjyLfzmUUrmzvWIhQ==
-----END EC PRIVATE KEY-----`;

const jobId = 'job:e39ac4daa9a8fe88d9f074cecfd537d18eb0fbf1196c1b4dd85749bcc50723e9:10';
const responseHash = ', and what the cost should be.\n\nDynamics and Security\n\nThe main features';

async function submit(entryPoint, argsMap) {
  const pk = sdk.PrivateKey.fromPem(PROVIDER_PEM, sdk.KeyAlgorithm.SECP256K1);
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
  if (data.error) { console.log(entryPoint + ' ERROR:', data.error); return; }
  await new Promise(r => setTimeout(r, 25000));
  const info = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
  }).then(r => r.json());
  const exec = info.result?.execution_info?.execution_result?.Version2;
  console.log(entryPoint + ':', exec?.error_message || 'SUCCESS');
}

await submit('provider_complete', {
  job_id: sdk.CLValue.newCLString(jobId),
  response_hash: sdk.CLValue.newCLString(responseHash),
});
