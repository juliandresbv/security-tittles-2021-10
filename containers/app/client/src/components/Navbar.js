import React from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import {AppBar, Toolbar, IconButton} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu';
import { useHistory }from 'react-router-dom';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { useSelector, useDispatch } from 'react-redux';
import { selectUsername, signoutAsync, signoutAllAsync } from '../redux/authSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    cursor: 'pointer'
  },
}));

export default function Navbar() {
  const classes = useStyles();
  const history = useHistory();

  const dispatch = useDispatch();
  const username = useSelector(selectUsername);

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

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          {username
            ?
            <Typography variant="h6" className={classes.title} onClick={() => {history.push('/dashboard')}}>
              App
            </Typography>
            :
            <Typography variant="h6" className={classes.title} onClick={() => {history.push('/')}}>
              App
            </Typography>
          }

          {username
            ?(
              <div>
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