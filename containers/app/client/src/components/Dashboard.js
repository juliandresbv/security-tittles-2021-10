import React, { useState, useEffect } from 'react';

import Navbar from './Navbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import { useHistory, useLocation } from "react-router-dom";
import axios from 'axios';
import { Box } from '@material-ui/core'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import _ from 'underscore';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: '30px',
    // backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Dashboard(){
  const classes = useStyles();
  const history = useHistory();

  

  return (
    <div>
      <Navbar />
      <Grid container className={classes.root} spacing={2} justify="center">
        <AccountTodos />
      </Grid>

      <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>{history.push('/createItem')}}>
        <AddIcon />
      </Fab>

    </div>
  );
}


function AccountTodos(){

  const history = useHistory();

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  let [toDos, setToDos] = useState([]);
  let [hasNextPage, setHasNextPage] = useState([]);


  const query = useQuery().get('page'); 
  const page =  (query) ? parseInt(query, 10) : 1;

  useEffect(()=>{
    axios.get(`/api/todo?page=${page - 1}`, jwtHeader)
      .then((res) => {
        setToDos(res.data);
      })
    axios.get(`/api/todo?page=${page}`, jwtHeader)
      .then((res) => {
        if(res.data.length > 0){
          setHasNextPage(true);
        }
        else {
          setHasNextPage(false);
        }
      })
  }, [publicKey, page]);

  function handleItemClick(e){
    history.push('/editItem/'+ e._id);
  }

  return (
    <Grid item lg={4} md={6} xs={12}>
      <Paper elevation={1}>
        <Grid container spacing={1} justify="center">
          <Grid item xs={12}>
            <Box 
              display="flex" 
              alignItems="center"
              justifyContent="center"
            >
              <Typography noWrap variant="h4">
                Todos tus cheques
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box 
              display="flex" 
              alignItems="center"
              justifyContent="center"
            >
              <Typography noWrap variant="subtitle1">
                {publicKey}
              </Typography>
            </Box>
          </Grid>

          <Box 
            display="flex" 
            alignItems="center"
            justifyContent="center"
          >
            <Typography noWrap variant="h4">
              Cheques girados
            </Typography>
          </Box>

          <Grid item xs={12}>
            <List component="nav" aria-label="main mailbox folders">
              {toDos.map((e) => 
                <ListItem button key={e._id} onClick={() => {handleItemClick(e)}}>
                  <ListItemIcon>
                    <EditIcon />
                  </ListItemIcon>
                  <ListItemText primary={e._id} />
                  
                </ListItem>
              )}
            </List>
          </Grid>
          <Grid item xs={12}>
            <Box display="flex" 
              alignItems="center"
              justifyContent="center"
            >
              <IconButton aria-label="delete" 
                disabled={page < 2}
                onClick={()=> history.replace(`/dashboard?page=${page-1}`)}>
                <ChevronLeft />
              </IconButton>
              Page: {page}
              <IconButton aria-label="delete" 
                disabled={!hasNextPage}
                onClick={()=> history.replace(`/dashboard?page=${page+1}`)}>
                <ChevronRight />
              </IconButton>
              
            </Box>
          </Grid>
          

        </Grid>
      </Paper>
    </Grid>
  );
}

AccountTodos.propTypes = {
}

export default Dashboard;