import pkg from 'casper-js-sdk';
const sdk = pkg;
const { PrivateKey, KeyAlgorithm, CLValue, Args, DeployHeader, ExecutableDeployItem, Deploy } = sdk;

const RPC_URL = 'http://localhost:7778/rpc';
const CHAIN_NAME = 'casper-test';

const PEM = `-----BEGIN EC PRIVATE KEY-----
MHQCAQEEIA6Hjhvhzz4rc5cKlR3fOtI42H8E1VOqpdpe6P/Nc7qvoAcGBSuBBAAK
oUQDQgAEJ9jdXMqmAORbNuWY2Q74wmtsZ++Bvf696PpYOZepHqWCFmTFZDzW+JYO
fZf7vQid4otudHLFJBWkiazcayJz9g==
-----END EC PRIVATE KEY-----`;

async function main() {
  const privateKey = PrivateKey.fromPem(PEM, KeyAlgorithm.SECP256K1);
  const publicKey = privateKey.publicKey;

  const wasmBytes = (await import('fs')).readFileSync('/tmp/transfer_session.wasm');
  const args = Args.fromMap({
    target_purse: CLValue.newCLUref(sdk.URef.fromString('uref-e02676292b1d6195a21122c89ebc405af79f45823c53ac823273b25aefbb4ebf-004')),
    amount: CLValue.newCLUInt512('1000'),
  });

  const session = ExecutableDeployItem.newModuleBytes(wasmBytes, args);
  const payment = ExecutableDeployItem.standardPayment('10000000000');
  const header = DeployHeader.default();
  header.account = publicKey;
  header.chainName = CHAIN_NAME;
  const deploy = Deploy.makeDeploy(header, payment, session);
  deploy.sign(privateKey);

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'account_put_deploy',
      params: { deploy: Deploy.toJSON(deploy) }
    })
  });
  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
