import React, { useState, useEffect } from 'react';

import Loading from './Loading.js'
import Navbar from './Navbar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';

import InformationDashboard from './InformationDashboard'

import { Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import ListDashboard from './ListDashboard';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F3F3F3",
    height: "92vh",
  },
  service: {
    padding: theme.spacing(2, 1.5),
  },
  black_tittle: {
    color: "#383838",
    fontWeight: 'bold',
    margin: theme.spacing(1, 0, 2.5, 0),
  },
  sub_tittle: {
    color: '#F76540',
    fontWeight: 'bold',
    margin: theme.spacing(2.5, 0, 1, 0)
  }
}));

const services = [
  {
    name: "Cheques",
    id: "titulo-001"
  }

]

const dataPrueba = {
  balanceCheques: 1800000,
  chequesDisponibles: 2,
  historialCheques:[
    {
      identificador: "123",
      tipo: "Expedido",
      valorNumeros: 50000,
      fechaCreacion: "15-15-2021"
    },
    {
      identificador: "123",
      tipo: "Recibido",
      valorNumeros: 50000,
      fechaCreacion: "15-15-2021"
    },
    {
      identificador: "123",
      tipo: "Expedido",
      valorNumeros: 50000,
      fechaCreacion: "15-15-2021"
    },
    {
      identificador: "123",
      tipo: "Recibido",
      valorNumeros: 50000,
      fechaCreacion: "15-15-2021"
    },
    {
      identificador: "123",
      tipo: "Expedido",
      valorNumeros: 50000,
      fechaCreacion: "15-15-2021"
    }
  ]
}



const Dashboard = (props) => {

  const classes = useStyles()

  const [interfas, setInterface] = useState(undefined)
  const [data, setData] = useState(undefined)

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  useEffect(() => {
    var body = []
    services.map(s => body.push(s.id))

    axios.get(`/api/todo/dashboard/`, { ...jwtHeader, params: { services: body } })
      .then((res) => {
        setInterface(res.data.interfaz);
        setData(dataPrueba)
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });
  }, [publicKey]);

  if (interfas === undefined || data === undefined) return <><Navbar /><Loading /></>
  return (
    <div>
      <Navbar />
      <Grid className={classes.root}>
        <Grid container justify="center">
          {interfas.map(s => (
            servicioDashboard(s)
          ))}
        </Grid>
      </Grid>
    </div>
  )

  function servicioDashboard(s) {

    return (
      <Grid item xs={11} md={5} className={classes.service}>
        <Typography component="h3" variant="h3" align="center" className={classes.black_tittle}>{s.name}</Typography>
        <InformationDashboard information={s.dashboard.information} data={data} />
        <Typography component="h5" variant="h5" className={classes.sub_tittle}>{s.dashboard.list.name}</Typography>
        <Grid container justify="center">
          <ListDashboard list={s.dashboard.list} data={data[s.dashboard.list.value]} states={s.dashboard.states}/>
        </Grid>
      </Grid>
    )
  }
}


export default Dashboard