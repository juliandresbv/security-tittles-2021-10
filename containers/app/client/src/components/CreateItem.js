import React from 'react';

import Grid from '@material-ui/core/Grid';
import Navbar from './Navbar';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import {buildTransaction} from '../helpers/signing';
import { useSelector, useDispatch } from 'react-redux';
import { selectPublicKey } from '../redux/authSlice';
import { selectJWTHeader } from '../redux/authSlice';

import axios from 'axios';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    padding: '30px',
  },
}));

function sleep(time){
  return new Promise((resolve) => {
    setTimeout(()=>{
      resolve();
    }, time);
  });
}

function CreateItem(){
  const classes = useStyles();

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  const history = useHistory();
  const formik = useFormik({
    initialValues: {
      valorNumeros: '',
      valorLetras: '',
      lugarEmision: '',
      fechaVencimiento: '',
      tipo: '',
      idBeneficiario: '',
      tipoIdentificacion: '',
    },
    validationSchema: Yup.object({
      valorNumeros: Yup.number().required('Required'),
      valorLetras: Yup.string().required('Required'),
      lugarEmision: Yup.string().required('Required'),
      fechaVencimiento: Yup.string().required('Required'),
      tipo: Yup.string().required('Required'),
      idBeneficiario: Yup.number().required('Required'),
      tipoIdentificacion: Yup.string().required('Required')
    }),
    onSubmit: async (values, {setStatus}) => {

      try{

        let ID = Math.floor(Math.random() * 10000) + ""; //Should probably use another
        
        const payload = {
          type: 'todo',
          id: ID,
          titulo:{
            servicio: "cheque",
            valorNumeros: values.valorNumeros,
            valorLetras: values.valorLetras,
            lugarEmision: values.lugarEmision,
            fechaVencimiento: values.fechaVencimiento,
            tipo: values.tipo,
            idBeneficiario: values.idBeneficiario,
            tipoIdentificacion: values.tipoIdentificacion,
          },
          input: null,
          output:{
            estado: "Activo",
            owner: publicKey
          }
        };

        let transaction = await buildTransaction(payload);
                
        await axios.post('/api/todo', transaction, jwtHeader);

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

      <form noValidate autoComplete="off" onSubmit={formik.handleSubmit} >
        <Grid container className={classes.root} spacing={2} direction="column" jusify="center" alignItems="center" >         
          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="idBeneficiario" 
              label="Identificación del beneficiario" 
              value={formik.values.idBeneficiario}
              onChange={formik.handleChange}
              error={formik.touched.idBeneficiario && Boolean(formik.errors.idBeneficiario)}
              helperText={formik.touched.idBeneficiario && formik.errors.idBeneficiario}
              disabled={formik.isSubmitting}
              autoFocus
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="tipoIdentificacion" 
              label="Tipo de identificación del beneficiario" 
              value={formik.values.tipoIdentificacion}
              onChange={formik.handleChange}
              error={formik.touched.tipoIdentificacion && Boolean(formik.errors.tipoIdentificacion)}
              helperText={formik.touched.tipoIdentificacion && formik.errors.tipoIdentificacion}
              disabled={formik.isSubmitting}
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="valorNumeros" 
              label="Valor en números" 
              value={formik.values.valorNumeros}
              onChange={formik.handleChange}
              error={formik.touched.valorNumeros && Boolean(formik.errors.valorNumeros)}
              helperText={formik.touched.valorNumeros && formik.errors.valorNumeros}
              disabled={formik.isSubmitting}
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="valorLetras" 
              label="Valor en letras" 
              value={formik.values.valorLetras}
              onChange={formik.handleChange}
              error={formik.touched.valorLetras && Boolean(formik.errors.valorLetras)}
              helperText={formik.touched.valorLetras && formik.errors.valorLetras}
              disabled={formik.isSubmitting}
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="lugarEmision" 
              label="Lugar de emisión" 
              value={formik.values.lugarEmision}
              onChange={formik.handleChange}
              error={formik.touched.lugarEmision && Boolean(formik.errors.lugarEmision)}
              helperText={formik.touched.lugarEmision && formik.errors.lugarEmision}
              disabled={formik.isSubmitting}
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="fechaVencimiento" 
              label="Fecha de vencimiento" 
              value={formik.values.fechaVencimiento}
              onChange={formik.handleChange}
              error={formik.touched.fechaVencimiento && Boolean(formik.errors.fechaVencimiento)}
              helperText={formik.touched.fechaVencimiento && formik.errors.fechaVencimiento}
              disabled={formik.isSubmitting}
              fullWidth
            />
          </Grid>

          <Grid item xs={4} style={{width:"100%"}}>
            <TextField 
              id="tipo" 
              label="Tipo de cheque" 
              value={formik.values.tipo}
              onChange={formik.handleChange}
              error={formik.touched.tipo && Boolean(formik.errors.tipo)}
              helperText={formik.touched.tipo && formik.errors.tipo}
              disabled={formik.isSubmitting}
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
                  disabled={formik.isSubmitting}
                >
                  Create
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
    </React.Fragment>
  );
}

export default CreateItem;