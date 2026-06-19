import pkg from 'casper-js-sdk';
const sdk = pkg;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';

const CONSUMER_PEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIA6Hjhvhzz4rc5cKlR3fOtI42H8E1VOqpdpe6P/Nc7qvoAcGBSuBBAAK
oUQDQgAEJ9jdXMqmAORbNuWY2Q74wmtsZ++Bvf696PpYOZepHqWCFmTFZDzW+JYO
fZf7vQid4otudHLFJBWkiazcayJz9g==
-----END EC PRIVATE KEY-----`;

async function main() {
  const consumerKey = sdk.PrivateKey.fromPem(CONSUMER_PEM, sdk.KeyAlgorithm.SECP256K1);
  const consumerPk = consumerKey.publicKey;

  const deploy = sdk.TransferDeployItem.newTransfer(
    '20000000000',
    sdk.URef.fromString('uref-8570fed7c444db9f0a5f29dd2deb7d132210e4a2d6009a4cdf6520d8d9432040-007')
  );

  const payment = sdk.ExecutableDeployItem.standardPayment('100000000');
  const header = sdk.DeployHeader.default();
  header.account = consumerPk;
  header.chainName = CHAIN_NAME;

  const session = new sdk.ExecutableDeployItem();
  session.transfer = deploy;

  const fullDeploy = sdk.Deploy.makeDeploy(header, payment, session);
  fullDeploy.sign(consumerKey);

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'account_put_deploy',
      params: { deploy: sdk.Deploy.toJSON(fullDeploy) }
    })
  });
  const data = await res.json();
  console.log('Transfer result:', data.error ? JSON.stringify(data.error) : 'submitted, hash=' + data.result?.deploy_hash);
  if (!data.error && data.result?.deploy_hash) {
    await new Promise(r => setTimeout(r, 25000));
    const info = await fetch(RPC_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
    }).then(r => r.json());
    const exec = info.result?.execution_info?.execution_result?.Version2;
    console.log('Execution:', exec?.error_message || 'SUCCESS');
  }
}

main().catch(console.error);
