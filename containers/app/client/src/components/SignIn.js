import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import {Grid, Paper, TextField, Typography, Button, MenuItem, Select} from '@material-ui/core';


import Navbar from './Navbar';

import { useHistory, useLocation } from "react-router-dom";

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useDispatch } from 'react-redux';
import { signinAsync } from '../redux/authSlice';

import { useStore } from 'react-redux';

import {selectMetamaskMessage} from '../redux/authSlice';

import {tryToEnableMetamask} from '../helpers/signing';

const identificaciones = [
  {
    value: "CC",
    label: "Cédula de ciudadanía"
  },
  {
    value: "CE",
    label: "Cédula de extrangería"
  },
  {
    value: "PS",
    label: "Pasaporte"
  }
]

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  root:{
    backgroundColor: "#F3F3F3",
    height: "100vh"
  },
  columns:{
    margin: theme.spacing(0, 2)
  },
  title:{
    margin: theme.spacing(2, 0)
  },
  inputs: {
    margin:theme.spacing(1.5 ,0)
  },
  form: {
    padding: theme.spacing(3,2),
    margin: theme.spacing(4 , 3)
  },
  button: {
    height: "50px",
    margin: theme.spacing(1,0),
    backgroundColor: "#F76540",
    color: "#FFF",
    "&:hover, &:focus": {
      backgroundColor: "#023e8a"
    }
  }
}));

const SignIn = () => {
  let location = useLocation();

  const { from } = location.state || { from: { pathname: "/dashboard" } };

  const state = useStore().getState();
  const [typeId, setTypeId] = useState("");

  const metamaskMessage = selectMetamaskMessage(state);

  const classes = useStyles();
  const history = useHistory();

  if(state.auth.username){
    history.replace(from);
  }

  useEffect(()=>{
    tryToEnableMetamask();
  }, [])
  
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required')
    }),
    
    onSubmit: async (values, {setStatus}) => {
      try{
        await dispatch(signinAsync(values.email, values.password));
        history.replace(from);
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

  const handleChange = ( event ) => {
    setTypeId(event.target.value)
  }


  //<Navbar />
  return (
    <div >
      
      <CssBaseline />
      <Grid container justify="center" alignItems="center" className={classes.root}>
        <Grid item xs={12} md={6} className={classes.columns}>
          <Typography component="h2" variant="h2" className={classes.title}>Todos tus títulos valores al alcance de un click</Typography>
          <Typography component="h6" variant="h6">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce convallis pellentesque metus id lacinia. Nunc dapibus pulvinar auctor. Duis nec sem at orci commodo viverra id in</Typography>
        </Grid>
        <Grid item xs={12} md={4} className={classes.columns}>
          <Paper elevation={3} justify="center">
            <div className={classes.form}>

              <Typography variant="h3" align="center" className={classes.title}>Bienvenido</Typography>
              {metamaskMessage &&
                <Typography variant="body1" color="error" align="center">
                  {(metamaskMessage == 'Please install MetaMask!')? 
                    <Link href="https://metamask.io/">
                      Para utilizar el app por favor instale Metamask. Haga clic aquí para instalarlo. 
                    </Link>
                    :
                    metamaskMessage
                  }
                </Typography>
              }

              <form className={classes.form} noValidate onSubmit={formik.handleSubmit}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="cedula"
                  label="Cédula"
                  name="cedula"
                  className={classes.inputs}
                />
                <Select
                  id="type-id"
                  value={typeId}
                  displayEmpty
                  onChange={handleChange}
                  variant="outlined"
                  required
                  className={classes.inputs}
                  style={{
                    width : "100%"
                  }}
                >
                  <MenuItem value="" disabled>Tipo de documento</MenuItem>
                  {identificaciones.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  className={classes.inputs}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  disabled={formik.isSubmitting || metamaskMessage}
                />
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  className={classes.inputs}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  disabled={formik.isSubmitting || metamaskMessage}
                />
                { formik.isSubmitting &&
                  <Grid container justify='center' >
                    <Grid item xs={1}>
                      <CircularProgress />
                    </Grid>
                  </Grid>
                }
                
                { formik.status &&
                  <Grid container justify='center' >
                    <Grid item xs={12}>
                      <Typography variant="body1" color="error">
                        { formik.status.error }
                      </Typography>
                    </Grid>
                  </Grid>
                }

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={formik.isSubmitting || metamaskMessage}
                >
                  Iniciar sesión
                </Button>
                <Typography component="p" variant="p" align="center" className={classes.inputs} onClick={() => {history.push('/signup')}}>¿Aún no tienes cuenta? <a id="SignUp" href="#">Registrarme</a></Typography>
                  
              </form>
            </div>
          </Paper>
        </Grid>
      </Grid>
      <Box mt={8}>
        <Copyright />
      </Box>
 
    </div>
  );
}

export default SignIn