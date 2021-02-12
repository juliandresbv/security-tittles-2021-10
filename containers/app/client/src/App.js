import './App.css';
import React, { useState, useEffect } from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { useDispatch } from 'react-redux'

import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Home from './components/blog/Blog';
import Dashboard from './components/Dashboard';
import PrivateRoute from './helpers/PrivateRoute';
import CreateItem from './components/CreateItem';
import EditItem from './components/EditItem';
import detectEthereumProvider from '@metamask/detect-provider';

const { setCurrentAccountAsync } = require("./redux/authSlice");


function App() {

  const dispatch = useDispatch();

  const [, setAcc] = useState(null);

  useEffect(async ()=>{
    //https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
    const provider = await detectEthereumProvider();
    let currentAccount;
    if (!provider) {
      console.log('Please install MetaMask!');
      return;
    }

    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');  
      return;
    }

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });


    function handleAccountsChanged(accounts){
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        dispatch(setCurrentAccountAsync(currentAccount));
        setAcc(currentAccount);  //Force refresh
      }
    }
  }, [])
  

  return(
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="/signin">
            <SignIn />
          </Route>
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute path="/createItem">
            <CreateItem />
          </PrivateRoute>
          <PrivateRoute path="/editItem/:id">
            <EditItem />
          </PrivateRoute>
          <Route path="/">
            <Home />
            {/* <Test /> */}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}


export default App;
