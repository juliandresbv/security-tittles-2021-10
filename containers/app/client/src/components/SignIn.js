import React, { useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

import Navbar from './Navbar';

import { useHistory, useLocation } from "react-router-dom";

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useDispatch } from 'react-redux';
import { signinAsync } from '../redux/authSlice';

import { useStore } from 'react-redux';

import {selectMetamaskMessage} from '../redux/authSlice';

import {tryToEnableMetamask} from '../helpers/signing';

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
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  let location = useLocation();

  const { from } = location.state || { from: { pathname: "/dashboard" } };

  const state = useStore().getState();

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


  return (
    <div >
      <Navbar />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in --
          </Typography>
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
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={formik.isSubmitting || metamaskMessage}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={formik.isSubmitting || metamaskMessage}
            />
            {/* <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            /> */}
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
              className={classes.submit}
              disabled={formik.isSubmitting || metamaskMessage}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                {/* <Link href="#" variant="body2">
                  Forgot password?
                </Link> */}
              </Grid>
              <Grid item>
                <Link href="#" variant="body2" onClick={() => {history.push('/signup')}}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
 
    </div>
  );
}