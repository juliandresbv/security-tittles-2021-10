import React, { useState, useEffect } from 'react';

import Grid from '@material-ui/core/Grid';
import Navbar from './Navbar';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import {Button, Paper} from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({

  root: {
    backgroundColor: "#F3F3F3",
    height: "100%",
  },
  padding_atributes:{
    padding: theme.spacing(3.5, 7)
  },
  atribute_name:{
    color: "#023e8a",
    fontWeight: 'bold',
    margin: theme.spacing(0.5, 0)
  },

  atribute_set: {
    margin: theme.spacing(0.5,0)
  },
  margin_title_detail:{
    margin: theme.spacing(3, 2.5, 2, 2.5),
    padding: theme.spacing(0, 2)
  },
  tittle_detail:{
    color: "#F76540",
    fontWeight: 'bold',
  },
  button_orange: {
    backgroundColor: "#F76540",
    color: "#FFF"
  },
  orange: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#F78440"
    }
  },
  blue: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#046AF0"
    }
  },
  grey: {
    backgroundColor: "#c6c6c6",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#000",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#8E8E8E"
    }
  }
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

  let [hasNextPage, setHasNextPage] = useState([]);

  let [ elemQueried, setElemQueried ] = useState(false);

  useEffect(()=>{
    (async () => {

      let res1 = await axios.get('/api/todo/'+id, jwtHeader)
        .catch(function (response) {
          //handle error
          console.log(response);
        });
      setElem(res1.data);
      setElemQueried(true);
    })();
    

  }, [id]);

  useEffect(()=>{
    (async () => {

      let res2 = await axios.get('/api/todo/'+id + `/history?page=${page-1}`, jwtHeader);
      let h = _.map(res2.data, t => {
        let s = JSON.parse(t.payload);
        return {
          block_num: t.block_num,
          owner: s.output.owner
        };
      });
      setHist(h);
      setElemQueried(true);

      let res3 = await axios.get('/api/todo/'+id + `/history?page=${page}`, jwtHeader);
      if(res3.data.length > 0){
        setHasNextPage(true);
      }
      else {
        setHasNextPage(false);
      }

    })();
    
  }, [id, page]);

  const formik = useFormik({
    initialValues: {
      text: (elem)? elem.titulo.valorNumeros: '',
      owner: (elem)? elem.output.owner: ''
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
            servicio: {
              nombre:"cheque",
              estado: "ENDOSADO",
            },
            owner: values.owner
          }
        };
 
        let transaction = await buildTransaction(payload);
                
        await axios.put('/api/todo/', transaction, jwtHeader);
  
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
  if(elem === null) return (<></>)
  else{
    return (
      <React.Fragment>
        <Navbar />
  
        <Grid className={classes.root}>
          <Grid container justify="center">
            <Grid container xs={12} justify="center">
              
              <Grid container xs={11} md={10} justify="space-between" className={classes.margin_title_detail}>
                <Typography className={classes.tittle_detail}  component="h4" variant="h4" align="left">Información del cheque</Typography>
                <Button className={classes.button_orange} onClick={() => {}}>Volver</Button>
              </Grid>
              <Grid item container xs={11} md={10}>
                <Paper elevation={3} style={{ width : "100%" }}>
                  <Grid container className={classes.padding_atributes}>
                    <Grid container xs={12} md={10}>
                    

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Identificador:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography noWrap>{id}</Typography></Grid>
                      

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Identificación beneficiario:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.idBeneficiario}</Typography></Grid>
                      
                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Tipo de identificación beneficiario:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.tipoIdentificacion}</Typography></Grid>
                    
                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Valor en números:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.valorNumeros}</Typography></Grid>

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Valor en letras:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.valorLetras}</Typography></Grid>

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Fecha de vencimiento:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.fechaVencimiento}</Typography></Grid>

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Tipo de cheque:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.tipo}</Typography></Grid>

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Lugar de emisión:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.titulo.lugarEmision}</Typography></Grid>

                      <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Estado:</Typography></Grid>
                      <Grid ietm xs={6} md={7}><Typography>{elem.output.servicio.estado}</Typography></Grid>

                    </Grid>
                    <Grid item xs={12} md={2} style={{ justifyItems : "center" }}>
                      <Grid item xs={12}><Button className={classes.orange} onClick={() => {}}>Endosar</Button></Grid>
            
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid style={{height: "25px"}}></Grid>
        </Grid>
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
                disabled={!hasNextPage}
                onClick={()=> history.replace(`/editItem/${id}?page=${page+1}`)}>
                <ChevronRight />
              </IconButton>
            </div>
          </Grid>
        </Grid>
  
      </React.Fragment>
    );
  }

}

export default CreateItem;