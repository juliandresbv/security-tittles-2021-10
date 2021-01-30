import { createSlice } from '@reduxjs/toolkit';
import _ from 'underscore';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    metamaskEnabled: false,
    accounts: {}, //{account, email}
    currentAccount: null
  },
  reducers: {
    init: (state, action) => {
      state.metamaskEnabled = action.payload.metamaskEnabled;
      state.accounts = action.payload.accounts;
      state.currentAccount = action.payload.currentAccount;
    },
    addAccount: (state, action) =>{
      state.accounts[action.payload.account] = action.payload;
    },
    removeAccount: (state, action) =>{
      delete state.accounts[action.payload];
    },
    removeAllAccounts: (state) =>{
      state.accounts = {};
    },
    setCurrentAccount: (state, action) =>{
      state.currentAccount = action.payload
    }
  },
});

export const { 
  init, addAccount, removeAccount, removeAllAccounts, setCurrentAccount 
} = authSlice.actions;

function localSaveAccounts(accounts, currentAccount){
  if(_.keys(accounts).length == 0){
    return localStorage.clear('auth');
  }
  localStorage.setItem('auth', JSON.stringify({currentAccount, accounts}));
}

function localGetAccounts(){
  let r = localStorage.getItem('auth');
  if(!r){
    return {accounts: {}, currentAccount: null};
  }
  return JSON.parse(r);
}

function localRemoveAccount(account){
  let {accounts, currentAccount} = localGetAccounts();

  delete accounts[account];
  localSaveAccounts(accounts, currentAccount);
}

function localRemoveAllAccounts(){
  localStorage.removeItem('auth');
}

function localSetCurrentAccount(account){
  let {accounts} = localGetAccounts();
  localSaveAccounts(accounts, account);
}

export const initAsync = () => async (dispatch) =>{
  let {accounts, currentAccount} = localGetAccounts();
  accounts = _.clone(accounts);

  let metamaskEnabled = false;
  if (typeof window.ethereum !== 'undefined') {
    metamaskEnabled = true;
  }

  dispatch(init({metamaskEnabled, accounts, currentAccount}))
}

export const signupAsync = (email, username, password) => async (dispatch, getState) => {
  let {accounts, currentAccount} = getState().auth;
  accounts = _.clone(accounts);
  if(!currentAccount){
    const _accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = _accounts[0];
  }
  let newAccount = {account: currentAccount, email};
  accounts[currentAccount] = newAccount;

  localSaveAccounts(accounts, currentAccount)
  dispatch(addAccount(newAccount));
} 

export const signinAsync = (email, password) => async (dispatch, getState) => {
  let {accounts, currentAccount} = getState().auth;
  accounts = _.clone(accounts);
  if(!currentAccount){
    const _accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = _accounts[0];
  }
  let newAccount = {account: currentAccount, email};
  accounts[currentAccount] = newAccount;

  localSaveAccounts(accounts, currentAccount)
  dispatch(addAccount(newAccount));
};

export const signoutAsync = () => async (dispatch, getState) => {
  let {currentAccount} = getState().auth;
  localRemoveAccount(currentAccount);
  dispatch(removeAccount(currentAccount));
};

export const signoutAllAsync = () => async (dispatch) => {
  localRemoveAllAccounts();
  dispatch(removeAllAccounts());
}; 

export const setCurrentAccountAsync = (account) => async (dispatch) =>{
  localSetCurrentAccount(account)
  dispatch(setCurrentAccount(account));
}

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectUsername = state => {
  if(state.auth.currentAccount && state.auth.currentAccount in state.auth.accounts){
    return state.auth.accounts[state.auth.currentAccount].email;
  }
  return null;
};

export default authSlice.reducer;
