import React, { useEffect, useState } from 'react';
import { Grid } from '@material-ui/core'
import { useParams } from "react-router-dom"
import { makeStyles } from "@material-ui/core/styles";

import InformationResumen from './InformationResumen'
import ListResumen from './ListResumen'

import Loading from './Loading.js'
import Navbar from './Navbar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';


const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F3F3F3",
    height: "92vh",
  }
}));

const dataPrueba ={
  fondosDisponibles: 2000000,
  fondosGirados: 50000,
  chequesDisponibles: 5,
  chequesGirados: [
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    }
  ],
  chequesRecibidos: [
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    },
    {
      identificador: "123",
      tipo: "General",
      valorNumeros: 20000,
      estado: "POSECION"
    }
  ]
}

const TitulosValorResumen = (props) => {


  const { service } = useParams()
  const [InterfaceService, setInterface] = useState(undefined)
  const [dataService, setData] = useState(undefined)

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  const classes = useStyles()

  useEffect(() => {

    axios.get(`/api/todo/resumen`, { ...jwtHeader, params: { service: service } })
      .then((res) => {
        setInterface(res.data.interfaz);
        setData(res.data.data)
        return "OK"
      })
      .then(res => {
        console.log(InterfaceService)
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });

  }, [service])

  if (InterfaceService === undefined || dataService === undefined) return <><Loading /></>
  return (
    <>
      <Grid className={classes.root}>
        <Grid container justify="center" direction={"row"} >
          {InterfaceService.resume.information.map(info => (
            <InformationResumen key={info.name} information={info} data={dataService} serviceId={service}/>
          ))}
        </Grid>
        <Grid container justify="center">
          {InterfaceService.resume.lists.map(list => (
            <ListResumen key={list.name} list={list} data={dataService[list.value]} service={service} states={InterfaceService.states} />
          ))}
        </Grid>
        <Grid style={{ height: "25px" }}></Grid>
      </Grid>
    </>
  )
}

export default TitulosValorResumen