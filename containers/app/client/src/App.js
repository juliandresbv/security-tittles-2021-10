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
import EditItem from './components/EditItem';
import detectEthereumProvider from '@metamask/detect-provider';
import TituloValorResumen from './components/TituloValorResumen';
import TituloValorCreate from './components/TituloValorCreate'
import Navbar from './components/Navbar'
import UserDetail from './components/UserDetail';
import TituloValorDetalle from './components/TituloValorDetalle';

const { setCurrentAccountAsync, setMetamaskMessage } = require("./redux/authSlice");


function App() {

  const dispatch = useDispatch();

  const [, setAcc] = useState(null);
  const [, setMM] = useState(null);

  useEffect(async ()=>{
    //https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
    const provider = await detectEthereumProvider();
    let currentAccount;
    if (!provider) {
      dispatch(setMetamaskMessage('Please install MetaMask!'));
      setMM('Please install MetaMask!');  //Force refresh
      return;
    }

    if (provider !== window.ethereum) {
      dispatch(setMetamaskMessage('Do you have multiple wallets installed?'));
      setMM('Do you have multiple wallets installed?');  //Force refresh
      return;
    }

    window.ethereum
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    function handleAccountsChanged(accounts){
      if (accounts.length === 0) {
        dispatch(setMetamaskMessage('Please connect to MetaMask and refresh page.'))
        setMM('Please connect to MetaMask.');  //Force refresh
      } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        dispatch(setCurrentAccountAsync(currentAccount));
        setAcc(currentAccount);  //Force refresh
      }
    }
  }, [])
  

  return(
    <Router>
      <Navbar />
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <PrivateRoute path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute path="/titulovalor/:service/create/:rol">
            <TituloValorCreate />
          </PrivateRoute>
          <PrivateRoute path="/titulovalor/:service/detalle/:id">
            <TituloValorDetalle />
          </PrivateRoute>
          <PrivateRoute path="/titulovalor/:service">
            <TituloValorResumen />
          </PrivateRoute>
          <PrivateRoute path="/userinformation/">
            <UserDetail />
          </PrivateRoute>
          <Route path="/signup">
            <SignUp />
          </Route>
          <Route path="">
            <SignIn />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}


export default App;
