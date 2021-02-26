const { ethers } = require("ethers");
const secp256k1 = require('secp256k1')

const CryptoJS = require('crypto-js')

async function main(){
  // generate privKey
  let privKey
  do {
    privKey = Buffer.from(CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex), 'hex');
  } while (!secp256k1.privateKeyVerify(privKey))

  const wallet = new ethers.Wallet(privKey);
  let pubKey = secp256k1.publicKeyConvert(Uint8Array.from(Buffer.from(wallet.publicKey.substr(2), 'hex')), true)

  console.log('priv:', privKey.toString('hex'))
  console.log('pub:', Buffer.from(pubKey).toString('hex'))

  pubKey = secp256k1.publicKeyCreate(privKey)
  console.log('pub:', Buffer.from(pubKey).toString('hex'))

  const message = "my message"
  const signatureEthers = await wallet.signMessage(message)
  console.log('sign:', signatureEthers)

  // const hashEthers = ethers.utils.keccak256(message);

  const hashEthers = ethers.utils.hashMessage(message);

  console.log('hashEthers:', hashEthers)
  const fromEthersToEthersRecoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashEthers, signatureEthers);
  const fromEthersToEthersRecoveredPubKey = ethers.utils.computePublicKey(fromEthersToEthersRecoveredPubKeyUncompressed, true);

  console.log();

  console.log('pubkey == fromEthersToEthersRecoveredPubKey?')
  console.log(Buffer.from(pubKey).toString('hex') == fromEthersToEthersRecoveredPubKey.slice(2))



  //Secp256
  let wrapped = "\x19Ethereum Signed Message:\n" + message.length + message;

  let hashSecp256 = ethers.utils.keccak256('0x' + Buffer.from(wrapped).toString('hex'));

  console.log('hashEthers == hashSecp256?')
  console.log(hashEthers == hashSecp256)

  let sinatureSecp = secp256k1.ecdsaSign(
    Uint8Array.from(Buffer.from(hashSecp256.substr(2), 'hex')),
    privKey
  );

  console.log('signatureEthers == sinatureSecp?')
  console.log(signatureEthers.slice(2, -2) == Buffer.from(sinatureSecp.signature).toString('hex'))
  console.log(parseInt(signatureEthers.slice(-2), 16) - 27 == sinatureSecp.recid);
  
  const fromSecpToSecpRecoveredPubKey = secp256k1.ecdsaRecover(
    sinatureSecp.signature, 
    sinatureSecp.recid, 
    Buffer.from(hashSecp256.slice(2), 'hex'), true);

  console.log('pubKey == fromSecpToSecpRecoveredPubKey?');
  console.log(Buffer.from(pubKey).toString('hex') == Buffer.from(fromSecpToSecpRecoveredPubKey).toString('hex'))

  const fromEthersToSecpRecoveredPubKey = secp256k1.ecdsaRecover(
    Uint8Array.from(Buffer.from(signatureEthers.slice(2,-2), 'hex')), 
    parseInt(signatureEthers.slice(-2), 16) - 27, 
    Buffer.from(hashSecp256.slice(2), 'hex'), true);

  console.log('pubKey == fromEthersToSecpRecoveredPubKey?');
  console.log(Buffer.from(pubKey).toString('hex') === Buffer.from(fromEthersToSecpRecoveredPubKey).toString('hex'));


  const fromSecpToEthersRecoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashSecp256, 
    '0x'+Buffer.from(sinatureSecp.signature).toString('hex') + ((sinatureSecp.recid + 27).toString(16)));
  const fromSecpToEthersRecoveredPubKey = ethers.utils.computePublicKey(fromSecpToEthersRecoveredPubKeyUncompressed, true);

  console.log('pubkey == fromSecpToEthersRecoveredPubKey?')
  console.log(Buffer.from(pubKey).toString('hex') == fromSecpToEthersRecoveredPubKey.slice(2))


}

main()
