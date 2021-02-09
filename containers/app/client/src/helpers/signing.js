const Web3 = require('web3');
const CryptoJS = require('crypto-js');

//https://github.com/ethereum/web3.js/blob/0.20.7/DOCUMENTATION.md
// let web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
let web3;
if (typeof window.web3 !== 'undefined') {
  web3 = new Web3(window.web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}


module.exports.web3 = web3;


const hash = (x) =>
  CryptoJS.SHA512(x).toString(CryptoJS.enc.Hex)

// https://stackoverflow.com/questions/33914764/how-to-read-a-binary-file-with-filereader-in-order-to-hash-it-with-sha-256-in-cr
function arrayBufferToWordArray(ab) {
  var i8a = new Uint8Array(ab);
  var a = [];
  for (var i = 0; i < i8a.length; i += 4) {
    a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
  }
  return CryptoJS.lib.WordArray.create(a, i8a.length);
}