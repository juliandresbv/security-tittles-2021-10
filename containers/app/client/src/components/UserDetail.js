import React, { useEffect, useState } from 'react';
import Accordion from '@material-ui/core/Accordion';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import { withStyles } from "@material-ui/core/styles";

import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Grid, makeStyles, Paper, TextField, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Chip } from '@material-ui/core'
import axios from 'axios';

import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';

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
}));



const UserDetail = () => {

  const classes = useStyles()

  const [userInformation, setUserInformation] = useState(undefined)
  const [services, setServices] = useState(undefined)
  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  const servs = [
    {
      name: "Cheques",
      id: "titulo-001",
      cost: 15000
    }

  ]

  useEffect(() => {
    var body = []

    axios.get(`/api/auth/whoami/`, jwtHeader)
      .then((res) => {
        setUserInformation(res.data);

        axios.get(`/api/todo/allservices/`, jwtHeader)
          .then((res) => {
            var newL = []
            servs.map(s => {
              for (var i = 0; i < res.data.length; i++) {
                if (res.data[i].id !== s.name) {
                  newL.push(res.data[i])
                }
              }
            })
            setServices(newL);
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


  if (userInformation === undefined) return <Loading />
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
                  <Grid ietm xs={6} md={7}><Typography noWrap>{userInformation.email}</Typography></Grid>


                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Identificación:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Tipo de identificación:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Correo:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Dirección:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Celular:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography>{userInformation.email}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Llave pública:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap>{userInformation.publicKey}</Typography></Grid>

                  <Grid item xs={6} md={5}><Typography className={classes.atribute_name} component="h5" variant="h5">Salso actual:</Typography></Grid>
                  <Grid ietm xs={6} md={7}><Typography noWrap><CurrencyFormat value={2000000} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography></Grid>

                </Grid>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={11} md={10} className={classes.section}>
            <Paper elevation={3}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="estados-head" id="estados-head">
                  <Typography className={classes.tittle_section} component="h4" variant="h4">Mis servicios</Typography>
                </AccordionSummary>
                <AccordionDetails className={classes.accordeon_detail}>
                  <Grid container className={classes.information_section}>
                    <Paper container className={classes.card_section} style={{ width: "100%" }}>
                      <TableContainer component={Paper} >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <StyledTableCell>Servicio</StyledTableCell>
                              <StyledTableCell>Identificación</StyledTableCell>
                              <StyledTableCell>Costo mensual</StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {servs.map(s => (
                              <StyledTableRow key={s.name}>
                                <StyledTableCell>{s.name}</StyledTableCell>
                                <StyledTableCell>{s.id}</StyledTableCell>
                                <StyledTableCell><CurrencyFormat value={s.cost} displayType={'text'} thousandSeparator={true} prefix={'$'} /></StyledTableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          
        </Grid>
      </Grid>
    )
  }
}



export default UserDetail