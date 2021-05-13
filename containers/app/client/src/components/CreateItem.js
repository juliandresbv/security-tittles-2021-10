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

import { Paper, Input } from '@material-ui/core'

import {buildTransaction} from '../helpers/signing';
import { useSelector, useDispatch } from 'react-redux';
import { selectPublicKey } from '../redux/authSlice';
import { selectJWTHeader } from '../redux/authSlice';

import Icon from './Icon'

var CurrencyFormat = require('react-currency-format');

import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#F3F3F3",
    height: "100%",
  },
  section: {
    margin: theme.spacing(2, 0)
  },
  tittle_section: {
    color: "#F76540",
    fontWeight: 'bold',
    padding: theme.spacing(2.5)
  },
  inputs:{
    padding: theme.spacing(2, 3, 1.8 ,3)
  },
  input_text: {
    color: "#023e8a",
    fontWeight: 'bold'
  },
  black_tittle: {
    color: "#383838",
    fontWeight: 'bold',
    margin: theme.spacing(2.5, 0, 1,0),
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
  }
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
            servicio: {
              nombre:"cheque",
              estado: "POSECION",
            },
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

      <Grid className={classes.root}>
        <Grid container justify="center" direction="row">
          <Grid item xs={11} md={4} className={classes.information}>
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

          <Grid item xs={11} md={4} className={classes.information}>
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

          <Grid item xs={11} md={2} className={classes.information}>
            <Paper elevation={3} >
              <Grid container className={classes.padding_info}>
                <Grid item xs={3} container justify="center" alignItems="center">
                  <Icon icon={"COIN"} size={60}/>
                </Grid>
                <Grid item xs={8} container direction={"column"}>
                  <Grid item>
                    <Typography  component="h6" variant="h6" align="right">Cheques Disponibles</Typography>
                  </Grid>
                  <Grid item>
                    <Typography component="h3" variant="h3" align="right" >2</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
        <Grid container justify="center">
          <Typography className={classes.black_tittle} component="h3" variant="h3">Girar Cheque</Typography>
        </Grid>

        <form noValidate autoComplete="off" onSubmit={formik.handleSubmit} >

          <Grid container justify="center">
            <Grid item xs={11} md={10} className={classes.section}>
              <Paper elevation={3}>
                <Grid container>
                  <Typography className={classes.tittle_section} component="h4" variant="h4">Información del cheque</Typography>
                </Grid>

                <Grid container>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Identificación beneficiario</Typography>
                      <TextField  
                        id="idBeneficiario"  
                        placeholder="Idnetificación del beneficiario" 
                        fullWidth 
                        variant="outlined" 

                        value={formik.values.idBeneficiario}
                        onChange={formik.handleChange}
                        error={formik.touched.idBeneficiario && Boolean(formik.errors.idBeneficiario)}
                        helperText={formik.touched.idBeneficiario && formik.errors.idBeneficiario}
                        disabled={formik.isSubmitting}
                        autoFocus
                      />
                    </Grid>
                  </Grid>
                  
                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Tipo de identificación beneficiario</Typography>
                      <TextField  
                        placeholder="Tipo de identificación del beneficiario" 
                        fullWidth variant="outlined" 
                        id="tipoIdentificacion" 
                        value={formik.values.tipoIdentificacion}
                        onChange={formik.handleChange}
                        error={formik.touched.tipoIdentificacion && Boolean(formik.errors.tipoIdentificacion)}
                        helperText={formik.touched.tipoIdentificacion && formik.errors.tipoIdentificacion}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  </Grid>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Valor en números</Typography>
                      <TextField  
                        placeholder="Valor en números" 
                        fullWidth 
                        variant="outlined" 
                        id="valorNumeros" 
                        value={formik.values.valorNumeros}
                        onChange={formik.handleChange}
                        error={formik.touched.valorNumeros && Boolean(formik.errors.valorNumeros)}
                        helperText={formik.touched.valorNumeros && formik.errors.valorNumeros}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  </Grid>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Valor en letras</Typography>
                      <TextField  
                        placeholder="Valor en letras" 
                        fullWidth 
                        variant="outlined" 
                        id="valorLetras" 
                        value={formik.values.valorLetras}
                        onChange={formik.handleChange}
                        error={formik.touched.valorLetras && Boolean(formik.errors.valorLetras)}
                        helperText={formik.touched.valorLetras && formik.errors.valorLetras}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  </Grid>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Tipo de cheque</Typography>
                      <TextField 
                        placeholder="Tipo de cheque" 
                        fullWidth 
                        variant="outlined" 
                        id="tipo" 
                        value={formik.values.tipo}
                        onChange={formik.handleChange}
                        error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                        helperText={formik.touched.tipo && formik.errors.tipo}
                        disabled={formik.isSubmitting} 
                      />
                    </Grid>
                  </Grid>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Fecha de vencimiento</Typography>
                      <TextField
                        placeholder="Valor en letras" 
                        fullWidth 
                        variant="outlined"
                        id="fechaVencimiento" 
                        value={formik.values.fechaVencimiento}
                        onChange={formik.handleChange}
                        error={formik.touched.fechaVencimiento && Boolean(formik.errors.fechaVencimiento)}
                        helperText={formik.touched.fechaVencimiento && formik.errors.fechaVencimiento}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  </Grid>

                  <Grid container xs={12} md={12} className={classes.inputs}>
                    <Grid item container direction="column">
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Lugar de expedición</Typography>
                      <TextField  
                        placeholder="Valor en letras" 
                        fullWidth 
                        variant="outlined" 
                        id="lugarEmision" 
                        value={formik.values.lugarEmision}
                        onChange={formik.handleChange}
                        error={formik.touched.lugarEmision && Boolean(formik.errors.lugarEmision)}
                        helperText={formik.touched.lugarEmision && formik.errors.lugarEmision}
                        disabled={formik.isSubmitting}
                      />
                    </Grid>
                  </Grid>


                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={11} md={10} className={classes.section}>
              <Paper elevation={3}>
                <Grid container>
                  <Typography className={classes.tittle_section} component="h4" variant="h4">Firma electrónica</Typography>
                </Grid>
                <Grid container >
                    
                  <Grid container justify="center">
                    <Typography component="h6" variant="h6">Antes de firmar, por favor revisar cuidadosamente la información del cheque.</Typography>
                  </Grid>

                  <Grid container xs={12} md={6} className={classes.inputs}>
                    <Grid item container direction="column" >
                      <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">Ingrése su cédua</Typography>
                      <TextField id="sign"  placeholder="Ingrese su número de cédula " fullWidth variant="outlined">
                      </TextField>
                    </Grid>
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
                  
                  <Grid container justify="center">
                    <Button 
                      className={classes.blue} 
                      onClick={() => {}} 
                      item
                      type="submit"
                      disabled={formik.isSubmitting}
                    >
                      Girar cheque
                    </Button>
                    <Button 
                      className={classes.orange} 
                      onClick={()=>{history.push('/dashboard')}}
                      item
                    >
                      Cancelar
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

          </Grid>
        </form>
        <Grid style={{height: "25px"}}></Grid>
      </Grid>

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