import pkg from 'casper-js-sdk';
const { PrivateKey, PublicKey, KeyAlgorithm } = pkg;

const keyPair = PrivateKey.generate(KeyAlgorithm.SECP256K1);
const privateKeyPem = keyPair.toPem();
const publicKeyHex = keyPair.publicKey.toHex();
const accountHash = keyPair.publicKey.accountHash().toHex();

console.log('=== Casper Testnet Provider Key ===');
console.log('Public Key (hex):', publicKeyHex);
console.log('Account Hash:', accountHash);
console.log('');
console.log('Private Key PEM:');
console.log(privateKeyPem);
console.log('');
console.log('Save this PEM to .env as CASPER_PROVIDER_KEY_PEM');
