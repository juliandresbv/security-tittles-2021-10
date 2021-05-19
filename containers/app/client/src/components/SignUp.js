import React, {useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Grid, makeStyles, Paper, TextField, Typography, MenuItem, Select, Button } from '@material-ui/core'


import Navbar from './Navbar';

import { useHistory } from "react-router-dom";
import { signupAsync } from '../redux/authSlice';
import { useDispatch } from 'react-redux';
import { useStore } from 'react-redux';
import {selectMetamaskMessage} from '../redux/authSlice';
import {tryToEnableMetamask} from '../helpers/signing';

import { useFormik } from 'formik';
import * as Yup from 'yup';

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
  root: {
    backgroundColor: "#F3F3F3",
    height: "100%",
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


const SignUp = (props) => {
  const classes = useStyles();

  const history = useHistory();
  const dispatch = useDispatch();
  const [typeId, setTypeId] = useState("");

  const handleChange = ( event ) => {
    setTypeId(event.target.value)
  }

  const metamaskMessage = selectMetamaskMessage(useStore().getState());

  useEffect(()=>{
    tryToEnableMetamask();
  }, [])
  
  const formik = useFormik({
    initialValues: {
      name: '',
      email:'',
      password: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required')
    }),
    onSubmit: async (values, {setStatus}) => {
      console.log("Se registra")
      try{
        await dispatch(signupAsync(values.email, values.firstName, values.password));
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
    <div>
      <CssBaseline />
      <Grid container justify="center" alignItems className={classes.root}>
        <Grid item container justify="center" alignItems="center" xs={11} md={5}>
          <Paper elevation={3} style={{ width : "100%",alignItems: "center"}}>
          
            <div className={classes.form}>          
              <Typography variant="h3" align="center" className={classes.title} >Registrate</Typography>
              {metamaskMessage &&
                <Typography variant="body1" color="error">
                  {(metamaskMessage == 'Please install MetaMask!')? 
                    <Link href="https://metamask.io/">
                      To use this app please install Metamask. Click here to Install.
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
                  id="name"
                  label="Nombre completo"
                  name="name"
                  className={classes.inputs}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={formik.isSubmitting || metamaskMessage}
                />
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
                  id="direccion"
                  label="Dirección"
                  name="direccion"
                  className={classes.inputs}
                />
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="celular"
                  label="Celular"
                  name="celular"
                  className={classes.inputs}
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
                  Sign Up
                </Button>
                <Typography component="p" variant="p" align="center" className={classes.inputs} onClick={() => {history.push('/signin')}}>¿Ya tienes cuenta? <a id="SignUp" href="#">Inicia sesión</a></Typography>
                 
              </form>
            </div>
          </Paper>
          <Box mt={5}>
            <Copyright />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default SignUp