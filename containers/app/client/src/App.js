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

const { setCurrentAccountAsync } = require("./redux/authSlice");


function App() {

  const dispatch = useDispatch();

  const [, setAcc] = useState(null);

  useEffect(async ()=>{
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', async function (accounts) {
        const account = accounts[0];
        dispatch(setCurrentAccountAsync(account));
        setAcc(account);  //Force refresh
      }); 
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
