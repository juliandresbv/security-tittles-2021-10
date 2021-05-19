import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, IconButton} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu';
import { useHistory, withRouter }from 'react-router-dom';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { useSelector, useDispatch } from 'react-redux';
import { selectUsername, signoutAsync, signoutAllAsync } from '../redux/authSlice';

import './navbar.css'

const useStyles = makeStyles((theme) => ({
  titleHeader: {
    margin: theme.spacing(2,4.5),
  },
  root: {
    flexGrow: 1,
  },
  title:{
    flexGrow: 1,
  },
  rightToolbar: {
    marginLeft: "auto",
    marginRight: -12
  },
  menuButton: {
    marginRight: 16,
    marginLeft: -12
  },
  icons:{
    fontSize: 40
  },
  elements: {
    margin: theme.spacing(1.5)
  },
  elements3: {
    margin: theme.spacing(3, 7)
  },
  select:{
    color: "#EB370A",
    fontWeight: 'bold',
    textTransform: 'none'
  },
  notSelect:{
    color: "#686868",
    textTransform: 'none'
  }
}));

const services = [
  {
    name: "Cheques",
    id: "titulo-001"  
  }
  //,
  //{
  //  name: "Pagarés",
  //  id: "aaaaa"
  //}

]

const Navbar = (props) => {

  const classes = useStyles();
  const history = useHistory();

  const dispatch = useDispatch();
  const username = useSelector(selectUsername);
  const [actualPage, setActualPage] = useState("Dashboard")

  const [anchorEl, setAnchorEl] = React.useState(null);


  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(signoutAsync());
    history.push('/');
  };

  const handleLogoutAll = () =>{
    setAnchorEl(null);
    dispatch(signoutAllAsync());
    history.push('/');
  }

  const goTo = (url, service) => {
    setActualPage(service)
    history.push(url)
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" style={{ backgroundColor: "#FFF"}}>
        <Toolbar>
          <h1 id="titulo-header" className={classes.titleHeader}>Títulos Valores</h1>
          <Button className={("Dashboard" === actualPage)? classes.select : classes.notSelect} onClick={() => goTo("/Dashboard", "Dashboard")} ><DashboardIcon />Dashboard</Button>
          {services.map(service => (<Button key="service.name" className={(service.name === actualPage)? classes.select : classes.notSelect} onClick={() => goTo(`/titulovalor/${service.id}`, service.name)}><AccountBalanceIcon/>{service.name}</Button>))}

          {username
            ?(
              <div className={classes.rightToolbar}>
                <Button
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  endIcon={<AccountCircle />}
                >
                  {username}
                </Button>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  <MenuItem onClick={handleLogoutAll}>Logout all</MenuItem>

                </Menu>
              </div>
            )
            :
            (
              <Button color="inherit" onClick={() => {history.push('/signin')}}>Sign in</Button>
            )

          }
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(Navbar)