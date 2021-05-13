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
import { Box, TableContainer,Chip,  Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import _ from 'underscore';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';
import { withStyles } from "@material-ui/core/styles";

import InformationResumen from './InformationResumen'
import Icon from './Icon'

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
  information: {
    margin: theme.spacing(2, 1)
  },
  padding_info: {
    padding: theme.spacing(1.2)
  },
  fondos_positivos: {
    color: '#3f9d2f',
    fontWeight: 'bold',
  },
  fondos_positivos_azules: {
    color: "#023e8a",
    fontWeight: 'bold'
  },
  fondos_negativos: {
    color: "#b31a1a",
    fontWeight: 'bold',
  },
  ORANGE: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(0,2)
  },
  BLUE: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(0,2)
  },
  GREY: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#000"
  },
  information2: {
    margin: theme.spacing(1, 0)
  },
  padding_tittle: {
    padding: theme.spacing(2.5)
  },
  padding_table: {
    padding: theme.spacing(0, 3.5)
  },
  tittle_list: {
    color: "#F76540",
    fontWeight: 'bold',
  },
  button_orange: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  },
  button_blue: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  },
  button_grey: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF"
  }
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
      <AccountTodos />

      <Fab color="primary" aria-label="add" className={classes.fab} onClick={()=>{history.push('/createItem')}}>
        <AddIcon />
      </Fab>

    </div>
  );
}


function AccountTodos(){

  const classes = useStyles();

  const history = useHistory();

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  let [toDos, setToDos] = useState(undefined);
  let [hasNextPage, setHasNextPage] = useState([]);


  const query = useQuery().get('page'); 
  const page =  (query) ? parseInt(query, 10) : 1;

  useEffect(()=>{
    console.log(page)
    axios.get(`/api/todo?page=${page - 1}`, jwtHeader)
      .then((res) => {
        console.log(res.data)
        setToDos(res.data);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
    axios.get(`/api/todo?page=${page}`, jwtHeader)
      .then((res) => {
        if(res.data.length > 0){
          setHasNextPage(true);
        }
        else {
          setHasNextPage(false);
        }
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  }, [publicKey, page]);

  function handleItemClick(e){
    history.push('/editItem/'+ e._id);
  }

  const StyledTableCell = withStyles((theme) => ({
    head: {
      color: "#023e8a",
      fontWeight: 'bold',
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    row:{

    }
      
  }))(TableRow);

  function table(data) {
    if(data.length <= 0){
      return (
        <Grid>
          <Typography>Esta lista está vacía</Typography>
        </Grid>
      )
    }
    else {
      return(
        <TableContainer >
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell id="Subtitulo2">Identificador</StyledTableCell>
                <StyledTableCell id="Subtitulo2">Tipo</StyledTableCell>
                <StyledTableCell id="Subtitulo2">Valor en Números</StyledTableCell>
                <StyledTableCell id="Subtitulo2">Estado</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <StyledTableRow hover key={row.identificador} onClick={() => {handleItemClick(row)}}>
                  {ValueFormater("ID", row._id)}
                  {ValueFormater("STRING", row.tipo)}
                  {ValueFormater("CURRENCY", row.valorNumeros)}
                  {ValueFormater("STATE", row.estado)}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>)
    }
  }

  function ValueFormater(type_value, value, id){

    const StyledTableCell = withStyles((theme) => ({
      head: {
        color: "#023e8a",
      },
      body: {
        fontSize: 14,
      },
    }))(TableCell);
    
    if(type_value === "CURRENCY"){
      return(
        <StyledTableCell component="th" scope="row"><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></StyledTableCell>
      )
    }
    else if (type_value === "STATE"){

      var state = "Activo"

      if(state !== undefined){

        return(
          <StyledTableCell component="th" scope="row"><Chip style={{width: "100%" , overflow: "hidden", backgroundColor: (state.color)}}  label={value}></Chip></StyledTableCell>
        )
      }
      return(
        <StyledTableCell component="th" scope="row"><Chip style={{width: "100%" , overflow: "hidden"}}  label={value}></Chip></StyledTableCell>
      )

    }
    else if(type_value === "STRING" || type_value === "DATE"){
      return(
        <>
          <StyledTableCell component="th" scope="row">{value}</StyledTableCell>
        </>
      )
    }
    else if(type_value === "ID"){
      var newId = value.slice(0, 40)
      return(
        <>
          <StyledTableCell component="th" scope="row">{newId}...</StyledTableCell>
        </>
      )
    }
    else{
      return(
        <StyledTableCell component="th" scope="row"><Button onClick={() => {}}>Ver</Button></StyledTableCell>
      )
    }
  }

  if(toDos === undefined){return(<></>)}
  else {

    return (<>
      <Grid style={{backgroundColor: "#F3F3F3", height: "100%"}}>
        <Grid container justify="center" direction={'row'}>


          <Grid item xs={11} md={3} className={classes.information}>
            <Paper elevation={3} >
              <Grid container className={classes.padding_info}>
                <Grid item xs={3} container justify="center" alignItems="center">
                  <Icon icon={"WALLET"} size={60}/>
                </Grid>
                <Grid item xs={8} container direction={"column"}>
                  <Grid item>
                    <Typography  component="h6" variant="h6" align="right">Fondos Disponibles</Typography>
                  </Grid>
                  <Grid item>
                    <Typography component="h3" variant="h3" align="right" ><CurrencyFormat value={2000000} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={11} md={3} className={classes.information}>
            <Paper elevation={3} >
              <Grid container className={classes.padding_info}>
                <Grid item xs={3} container justify="center" alignItems="center">
                  <Icon icon={"COIN"} size={60}/>
                </Grid>
                <Grid item xs={8} container direction={"column"}>
                  <Grid item>
                    <Typography  component="h6" variant="h6" align="right">Fondos Girados</Typography>
                  </Grid>
                  <Grid item>
                    <Typography component="h3" variant="h3" align="right" ><CurrencyFormat value={50} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={11} md={4} className={classes.information}>
            <Paper elevation={3} >
              <Grid container className={classes.padding_info}>
                <Grid item xs={3} container justify="center" alignItems="center">
                  <Icon icon={"BILL"} size={60}/>
                </Grid>
                <Grid item xs={5} container direction={"column"}>
                  <Grid item>
                    <Typography  component="h6" variant="h6" align="right">Cheques Disponibles</Typography>
                  </Grid>
                  <Grid item>
                    <Typography component="h3" variant="h3" align="right">2</Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4} container alignItems="center" justify="center">
                  <Button className={classes.ORANGE} onClick={()=>{history.push('/createItem')}} item>Usar cheque</Button>                  
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid container justify="center">

          <Grid item xs={11} md={10} className={classes.information2}>
            <Paper elevation={3}>
              <Grid container justify="space-between" className={classes.padding_tittle}>
                <Typography className={classes.tittle_list} component="h4" variant="h4" align="right">Cheques Girados</Typography>
                {/*<Button onClick={() => {goToAll()}} className={classes.button_orange}>{lista.button.b_string}</Button>*/}
              </Grid>
              <Grid container justify="center" className={classes.padding_table}>
                {table(toDos.chequesGirados)}
              </Grid>
            </Paper>

          </Grid>

          <Grid item xs={11} md={10} className={classes.information2}>
            <Paper elevation={3}>
              <Grid container justify="space-between" className={classes.padding_tittle}>
                <Typography className={classes.tittle_list} component="h4" variant="h4" align="right">Cheques Recibidos</Typography>
                {/*<Button onClick={() => {goToAll()}} className={classes.button_orange}>{lista.button.b_string}</Button>*/}
              </Grid>
              <Grid container justify="center" className={classes.padding_table}>
                {table(toDos.chequesRecibidos)}
              </Grid>
            </Paper>

          </Grid>

        </Grid>
      </Grid>
    </>
    );
  }

  
}

AccountTodos.propTypes = {
}

export default Dashboard;