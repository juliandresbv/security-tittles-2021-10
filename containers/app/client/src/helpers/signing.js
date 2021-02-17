const { ethers } = require("ethers");

let store;
let provider;

export function init(_store){
  store = _store;
  provider = new ethers.providers.Web3Provider(window.ethereum);
}

export async function getCurrentAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export async function getPublicKey() {
  const payload = 'SignIn';
  let signature = await signString(payload);

  const hashEthers = ethers.utils.hashMessage(payload);
  const recoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashEthers, signature);
  const publicKey = ethers.utils.computePublicKey(recoveredPubKeyUncompressed, true);

  return publicKey;
}

export async function buildTransaction(payload){
  let p = JSON.stringify(payload);
  let signature = await signString(p); 
  return {
    signature: signature,  // Hex string
    payload: p
  }
}

export async function signString(toSign){
  const signer = provider.getSigner();
  return await signer.signMessage(toSign);
}

function sleep(time){
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve();
    }, time);
  });
}