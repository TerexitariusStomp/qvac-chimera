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
  const key = sdk.PrivateKey.fromPem(CONSUMER_PEM, sdk.KeyAlgorithm.SECP256K1);
  const providerPubKeyHex = '024cb366b2c622fe954871b172b280994f1af703b7106b6512d900d97e5bcec2bf';

  const deploy = sdk.makeCsprTransferDeploy({
    senderPublicKeyHex: key.publicKey.toHex(),
    recipientPublicKeyHex: providerPubKeyHex,
    transferAmount: '20000000000',
    paymentAmount: '100000000',
    chainName: CHAIN_NAME,
  });

  deploy.sign(key);

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'account_put_deploy',
      params: { deploy: sdk.Deploy.toJSON(deploy) }
    })
  });
  const data = await res.json();
  console.log('Fund provider:', data.error ? 'ERROR: ' + JSON.stringify(data.error) : 'submitted, hash=' + data.result.deploy_hash);
  await new Promise(r => setTimeout(r, 25000));
  const info = await fetch(RPC_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'info_get_deploy', params: { deploy_hash: data.result.deploy_hash } })
  }).then(r => r.json());
  const exec = info.result?.execution_info?.execution_result?.Version2;
  console.log('Result:', exec?.error_message || 'SUCCESS');
}

main().catch(console.error);
