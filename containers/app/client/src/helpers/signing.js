const { ethers } = require("ethers");

let store;
let provider;

export function init(_store){
  store = _store;
  if(!window.ethereum){
    return console.log('No etheruem provider');
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
}

export function tryToEnableMetamask(){
  if(!window.ethereum){
    return console.log('No etheruem provider');
  }
  window.ethereum.enable();

}

export async function getCurrentAccount() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
}

export async function getPublicKey(payload) {
  let signature = await signString(payload);

  const hashEthers = ethers.utils.hashMessage(payload);
  const recoveredPubKeyUncompressed = ethers.utils.recoverPublicKey(hashEthers, signature);
  const publicKey = ethers.utils.computePublicKey(recoveredPubKeyUncompressed, true).slice(2);
  return {publicKey, signature};
}


//Inspired by:
//https://developer.bitcoin.org/reference/transactions.html#:~:text=Bitcoin%20transactions%20are%20broadcast%20between,part%20of%20the%20consensus%20rules.
// let t = {
//   txid:"",//signed hash of txn
//   transaction:{
//     input: {
//       txid: ""    
//     },
//     output:{
//       value: 1
//     }
//   }
// };


export async function buildTransaction(payload){
  let p = JSON.stringify(payload);
  let signature = await signString(p); 
  return {
    txid: signature,  // Hex string
    transaction: p
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