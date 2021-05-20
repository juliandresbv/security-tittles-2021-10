import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import { withStyles } from "@material-ui/core/styles";
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Grid, makeStyles, Paper, Button, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip } from '@material-ui/core'
import axios from 'axios';

import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';


import { buildTransaction } from '../helpers/signing';

import Loading from './Loading';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F3F3F3",
    height: "100vh",
  },
  tittle_list: {
    color: "#F76540",
    fontWeight: 'bold',
  },
  section: {
    margin: theme.spacing(2, 0)
  },
  tittle_section: {
    color: "#F76540",
    fontWeight: 'bold',
    padding: theme.spacing(2.5)
  },
  padding_atributes: {
    padding: theme.spacing(3.5, 7)
  },
  atribute_name: {
    color: "#023e8a",
    fontWeight: 'bold',
    margin: theme.spacing(0.5, 0)
  },
  ORANGE: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(0, 2),
    "&:hover, &:focus": {
      backgroundColor: "#F78440"
    }
  }
}));



const UserDetail = () => {

  const classes = useStyles()

  const [userInformation, setUserInformation] = useState(undefined)
  const [otherServices, setOtherServices] = useState(undefined)
  const [myServices, setMyServices] = useState(undefined)
  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  const servs = [
    {
      name: "Cheques",
      id: "titulo-001",
      cost: 15000
    }

  ]


  function sleep(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }


  useEffect(() => {
    var body = []

    axios.get(`/api/auth/whoami/`, jwtHeader)
      .then((res) => {
        setUserInformation(res.data);

        axios.get(`/api/todo/allservices/`, jwtHeader)
          .then((dat) => {
            var newL = []
            var listS = []
            res.data.services.map(s => {
              for (var i = 0; i < dat.data.length; i++) {
                if (dat.data[i].id !== s.id) {
                  newL.push(dat.data[i])
                }
                else {
                  listS.push(dat.data[i])
                }
              }
            })
            setMyServices(listS)
            setOtherServices(newL);
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });

  }, [publicKey]);

  const StyledTableCell = withStyles((theme) => ({
    head: {
      color: "#FFF",
      fontWeight: 'bold',
      backgroundColor: "#035FD6"
    },
    body: {
      fontSize: 15,
      backgroundColor: "#FFF"
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({

  }))(TableRow);

  async function onSubmit() {

    try {

      for (var i = 0; i < 5; i++) {

        let ID = Math.floor(Math.random() * 10000) + ""; //Should probably use another

        const payload = {
          type: 'todo',
          id: ID,
          titulo: null,
          input: null,
          output: {
            servicio: {
              nombre: "cheque",
              estado: "En Poseción",
            },
            owner: publicKey
          }
        };

        let transaction = await buildTransaction(payload);

        await axios.post('/api/todo', transaction, jwtHeader);

        await sleep(1000);
      }


      history.replace('/dashboard');
    }
    catch (e) {
      let error;
      if (e.response) {
        error = JSON.stringify(e.response.data);
      } else {
        error = e.message;
      }

    }

  }

  if (userInformation === undefined || myServices === undefined) return <Loading />
  else {
    return (
      <Grid className={classes.root}>
        <Grid container justify="center" direction={"row"} >
          <Grid item xs={11} md={10} className={classes.section}>
            <Paper elevation={3}>
              <Typography className={classes.tittle_section} component="h4" variant="h4">Información del usuario</Typography>
              <Grid container className={classes.padding_atributes}>
                <Grid container xs={12} md={10}>


                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Nombre:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap>{userInformation.name}</Typography></Grid>


                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Identificación:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.id}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Tipo de identificación:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.typeId}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Correo:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Dirección:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.address}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Celular:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.phone}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Llave pública:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap>{userInformation.publicKey}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Salso actual:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap><CurrencyFormat value={userInformation.balance} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography></Grid>

                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={11} md={10} className={classes.section}>
            <Paper elevation={3}>
              <Typography className={classes.tittle_section} component="h4" variant="h4">Mis servicios</Typography>
              <TableContainer component={Paper} >
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Servicio</StyledTableCell>
                      <StyledTableCell>Identificación</StyledTableCell>
                      <StyledTableCell>Costo mensual</StyledTableCell>
                      <StyledTableCell>Servicios</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myServices.map(s => (
                      <StyledTableRow key={s.name}>
                        <StyledTableCell>{s.name}</StyledTableCell>
                        <StyledTableCell>{s.id}</StyledTableCell>
                        <StyledTableCell><CurrencyFormat value={s.cost} displayType={'text'} thousandSeparator={true} prefix={'$'} /></StyledTableCell>
                        <StyledTableCell>
                          <Button
                            className={classes.ORANGE}
                            onClick={() => { onSubmit() }}
                            item
                            type="submit"
                          >
                            Comprar 5 cheques
                          </Button>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
            </Paper>
          </Grid>

        </Grid>
      </Grid>
    )
  }
}



export default UserDetail

/* <Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="estados-head" id="estados-head">
  </AccordionSummary>
  <AccordionDetails className={classes.accordeon_detail}>
    <Grid container className={classes.information_section}>
      <Paper container className={classes.card_section} style={{ width: "100%" }}>
      </Paper>
    </Grid>
  </AccordionDetails>
</Accordion> */