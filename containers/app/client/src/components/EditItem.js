import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Navbar from './Navbar';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import {
  useParams,
  useLocation
} from "react-router-dom";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {buildTransaction} from '../helpers/signing';
import _ from 'underscore';
import { useSelector } from 'react-redux';
import { selectJWTHeader } from '../redux/authSlice';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';

import axios from 'axios';

function sleep(time){
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve();
    }, time);
  });
}

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    padding: '30px',
  },
}));

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function CreateItem(){
  const classes = useStyles();
  const history = useHistory();
  const jwtHeader = useSelector(selectJWTHeader);

  let { id } = useParams();


  let [ elem, setElem ] = useState(null);
  let [ hist, setHist ] = useState(null);

  const query = useQuery().get('page'); 
  const page =  (query) ? parseInt(query, 10) : 1;

  let [ elemQueried, setElemQueried ] = useState(false);

  useEffect(()=>{
    (async () => {

      let res1 = await axios.get('/api/'+id, jwtHeader);
      setElem(res1.data);
      setElemQueried(true);
    })();
    

  }, [id]);

  useEffect(()=>{
    (async () => {

      let res2 = await axios.get('/api/'+id + `/history?page=${page-1}`, jwtHeader);
      let h = _.map(res2.data, t => {
        let s = JSON.parse(t.payload);
        return {
          block_num: t.block_num,
          owner: s.output.owner
        };
      });
      setHist(h);
      setElemQueried(true);
    })();
    
  }, [id, page]);

  const formik = useFormik({
    initialValues: {
      text: (elem)? elem.value.value: '',
      owner: (elem)? elem.value.owner: ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      text: Yup.string().required('Required')
    }),
    onSubmit: async (values, {setStatus}) => {
    

      try{
        const payload = {
          type: 'todo',
          
          input: id,
          output:{
            value: elem.value.value,
            owner: values.owner
          }
        };
 
        let transaction = await buildTransaction(payload);
                
        await axios.put('/api/', transaction, jwtHeader);
  
        await sleep(1000);
  
        history.replace('/dashboard');
      }
      catch(e){
        let error;
        if(e.response){
          error = JSON.stringify(e.response.data);
        }else{
          error = e.message;
        }
        setStatus({error});
      }

    },
  });

  return (
    <React.Fragment>
      <Navbar />
      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit}>
        <Grid container className={classes.root} spacing={2} direction="column" jusify="center" alignItems="center">
          <Grid item xs={12} md={4} style={{width:"100%", display: 'flex', flexDirection: 'column', alignItems: "center"}} >
            <Typography noWrap variant="h4">
              ToDo
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} style={{width:"100%"}}>
            <Typography variant="body1" noWrap>
              {id} {(elemQueried && !elem)? ', Not found': ''}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} style={{width:"100%"}}>
            <TextField 
              id="text" 
              label="Text" 
              value={formik.values.text}
              onChange={formik.handleChange}
              error={formik.touched.text && Boolean(formik.errors.text)}
              helperText={formik.touched.text && formik.errors.text}
              // disabled={formik.isSubmitting || !elem}
              disabled={true}
              autoFocus
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={4} style={{width:"100%"}}>
            <TextField 
              id="owner" 
              label="owner" 
              value={formik.values.owner}
              onChange={formik.handleChange}
              error={formik.touched.text && Boolean(formik.errors.owner)}
              helperText={formik.touched.owner && formik.errors.owner}
              disabled={formik.isSubmitting || !elem}
              autoFocus
              fullWidth
            />
          </Grid>

          { formik.isSubmitting &&
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          }

          { formik.status &&
            <Grid item xs={12}>
              <Typography variant="body1" color="error">
                { formik.status.error }
              </Typography>
            </Grid>
          }

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={formik.isSubmitting || !elem}
                >
                  Save
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="default"
                  className={classes.submit}
                  disabled={formik.isSubmitting}
                  onClick={()=>{history.push('/dashboard')}}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
      <Grid container className={classes.root} spacing={2} direction="column" jusify="center" alignItems="center">
        
        <Grid item xs={12} md={4} style={{width:"100%", display: 'flex', flexDirection: 'column', alignItems: "center"}} >
          <Typography noWrap variant="h4">
            History
          </Typography>
        </Grid>

        <Grid item xs={4}>
          <List component="nav" aria-label="main mailbox folders">
            {hist && _.map(hist, (e, k) => 
              <ListItem key={k}>
                <ListItemText primary={'BlockNum: ' + e.block_num} secondary={'Owner: ' + e.owner}/>
              </ListItem>
            )}
          </List>
        </Grid>
        <Grid item xs={12} md={4} style={{width:"100%", display: 'flex', flexDirection: 'column', alignItems: "center"}} >
          <div>
            <IconButton aria-label="delete" 
              disabled={page < 2}
              onClick={()=> history.replace(`/editItem/${id}?page=${page-1}`)}>
              <ChevronLeft />
            </IconButton>
            Page: {page}
            <IconButton aria-label="delete" 
              disabled={hist && hist.length == 0}
              onClick={()=> history.replace(`/editItem/${id}?page=${page+1}`)}>
              <ChevronRight />
            </IconButton>
          </div>
        </Grid>
      </Grid>

    </React.Fragment>
  );
}

export default CreateItem;