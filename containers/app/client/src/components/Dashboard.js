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
import Paper from '@material-ui/core/Paper';
import _ from 'underscore';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectPublicKey } from '../redux/authSlice';

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

  const publicKey = useSelector(selectPublicKey);

  let [myToDos, setMyToDos] = useState([]);
  let [toDos, setToDos] = useState([]);


  useEffect(()=>{
    axios.get('/api/')
      .then((res) => {        
        let t = _.groupBy(res.data, (e)=>{
          return e.value.owner;
        })

        setMyToDos(t[publicKey] || []);
        setToDos(_.omit(t, publicKey));
      })
  }, []);

  function handleItemClick(e){
    history.push('/editItem/'+ e.key);
  }

  return (
    <div>
      <Navbar />
      <Grid container className={classes.root} spacing={2} justify="center">
        <AccountTodos 
          toDos={myToDos} 
          key={publicKey} 
          owner={publicKey}
          handleItemClick={handleItemClick} />
        {_.chain(toDos)
          .keys()
          .map((k) => {
            return (
              <AccountTodos toDos={toDos[k]} owner={toDos[k][0].value.owner} key={k} handleItemClick={handleItemClick}/>
            )
          })
          .value()
        }
      </Grid>

      <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>{history.push('/createItem')}}>
        <AddIcon />
      </Fab>

      
    </div>
  );
}


function AccountTodos(props){

  const publicKey = useSelector(selectPublicKey);

  const classes = useStyles();
  const history = useHistory();

  function handleItemClick(e){
    history.push('/editItem/'+ e.key);
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
              {(publicKey == props.owner)?
                (
                  <Typography noWrap variant="h4">
                    My ToDo&apos;s
                  </Typography>
                )
                :
                <Typography noWrap variant="h4">
                  Other Account
                </Typography>
              }
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box 
              display="flex" 
              alignItems="center"
              justifyContent="center"
            >
              <Typography noWrap variant="subtitle1">
                {props.owner}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <List component="nav" aria-label="main mailbox folders">
              {props.toDos.map((e) => 
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
                disabled={publicKey !== props.owner}
              >
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

AccountTodos.propTypes = {
  toDos: PropTypes.object,
  owner: PropTypes.string,
  handleItemClick: PropTypes.func
}

export default Dashboard;