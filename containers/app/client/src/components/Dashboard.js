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
import { useHistory } from "react-router-dom";

import { useStore } from 'react-redux';

import axios from 'axios';

const { ethers } = require("ethers");


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

function Dashboard(){
  const classes = useStyles();
  const history = useHistory();

  let [todos, setTodos] = useState([]);

  useEffect(()=>{
    axios.get('/api/')
      .then((res) => {
        setTodos(res.data)
      })
  }, []);

  function handleItemClick(e){
    history.push('/editItem/'+ e.id);
  }

  return (
    <div>
      <Navbar />
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">
            ToDo&apos;s
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <List component="nav" aria-label="main mailbox folders">
            {todos.map((e) => 
              <ListItem button key={e.id} onClick={() => {handleItemClick(e)}}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={e.text} />
              </ListItem>
            )}
          </List>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            startIcon={<AddIcon />}
            onClick={()=>{history.push('/createItem')}}
          >
            Add
          </Button>
        </Grid>
      </Grid>

      <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>{history.push('/createItem')}}>
        <AddIcon />
      </Fab>

      
    </div>
  );
}

export default Dashboard;