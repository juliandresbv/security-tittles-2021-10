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
import axios from 'axios';
import { Box } from '@material-ui/core'

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
    history.push('/editItem/'+ e.key);
  }

  return (
    <div>
      <Navbar />
      <Grid container className={classes.root} spacing={2} justify="center">
        <Grid item xs={12}>
          <Box 
            display="flex" 
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h2">
              ToDo&apos;s
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <List component="nav" aria-label="main mailbox folders">
            {todos.map((e) => 
              <ListItem button key={e.key} onClick={() => {handleItemClick(e)}}>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={e.value.value} />
              </ListItem>
            )}
          </List>
          <Box display="flex" 
            alignItems="center"
            justifyContent="center"
          >
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              startIcon={<AddIcon />}
              onClick={()=>{history.push('/createItem')}}
            >
              Add
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>{history.push('/createItem')}}>
        <AddIcon />
      </Fab>

      
    </div>
  );
}

export default Dashboard;