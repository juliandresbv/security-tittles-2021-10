import React, { useState, useEffect } from 'react';
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import ReceiptIcon from '@material-ui/icons/Receipt';

const Icon = (props) => {

  const icon = props.icon
  const size = props.size

  if (icon === undefined){return ( <></> )}
  else if(icon === "WALLET"){return ( <AccountBalanceWalletIcon style={{fontSize: size}}/> )}
  else if(icon === "COIN"){return  ( <MonetizationOnIcon style={{fontSize: size}}/>)}
  else if(icon === "BILL"){return (<ReceiptIcon style={{fontSize: size}}/>)}
  else {return <AccountBalanceIcon style={{fontSize: size}}/>}

}

export default Icon