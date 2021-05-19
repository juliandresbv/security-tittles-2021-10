import { Grid, makeStyles, Paper, TextField, Typography, Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import InformationResumen from './InformationResumen';
import { withRouter } from 'react-router-dom';
import NumberFormat from 'react-number-format';
import { useHistory } from "react-router-dom";

import { useFormik } from 'formik';
import * as Yup from 'yup';

import { buildTransaction } from '../helpers/signing';

import Loading from './Loading.js'
import Navbar from './Navbar';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectPublicKey, selectJWTHeader } from '../redux/authSlice';
import InputSelect from './InputSelect';

var CurrencyFormat = require('react-currency-format');

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
  inputs: {
    padding: theme.spacing(2, 3, 1.8, 3)
  },
  input_text: {
    color: "#023e8a",
    fontWeight: 'bold'
  },
  black_tittle: {
    color: "#383838",
    fontWeight: 'bold',
    margin: theme.spacing(2.5, 0, 1, 0),
  },
  ORANGE: {
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
  BLUE: {
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
  GREY: {
    backgroundColor: "#c6c6c6",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#000",
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    "&:hover, &:focus": {
      backgroundColor: "#8E8E8E"
    }
  }
}));


const TituloValorCreate = (props) => {

  const classes = useStyles()

  const { service } = useParams()
  const { rol } = useParams()
  const userInformation = props.userInformation

  const [information, setInterface] = useState(undefined)
  const [data, setData] = useState(undefined)

  const publicKey = useSelector(selectPublicKey);
  const jwtHeader = useSelector(selectJWTHeader);

  const history = useHistory();

  const onHandleClick = (action) => {
    if (action === "create") {
      console.log("")
    }
    else {
      props.history.goBack()
    }
  }

  useEffect(() => {

    axios.get(`/api/todo/create`, { ...jwtHeader, params: { service: service, rol: rol } })
      .then((res) => {
        setInterface(res.data.interfaz);
        setData(res.data.data)
      })
      .catch(function (response) {
        //handle error
        console.log(response);
      });

  }, [])

  const formik = useFormik({
    initialValues: {
      
    },
    validationSchema: Yup.object({
      
    }),
    onSubmit: async (values, {setStatus}) => {

      try{

        let ID = Math.floor(Math.random() * 10000) + ""; //Should probably use another
        
        const payload = {
          type: 'todo',
          id: ID,
          titulo:{},
          input: null,
          output:{
            servicio: {
              nombre:"cheque",
              estado: "POSECION",
            },
            owner: publicKey
          }
        };

        information.components.map(c => {
          if (c.type === "INPUT") {
            c.inputs.map(i => {
              var valueName = i.atribute.value
              var value
              if (i.atribute.type === "SELECT") {
                value = document.getElementById(valueName).nextSibling.value
              }
              else if(i.atribute.type === "CURRENCY"){
                value = parseInt(document.getElementById(valueName).value)
              }
              else {
                value = document.getElementById(valueName).value
              }
              console.log(valueName)
  
              payload.titulo[i.atribute.value] = value
            })
          }
        })

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

  function sleep(time){
    return new Promise((resolve) => {
      setTimeout(()=>{
        resolve();
      }, time);
    });
  }

  if (information === undefined || data === undefined) return <Loading />
  return (
    <>
      <Grid className={classes.root}>
        <Grid container justify="center" direction="row">
          {information.information.map(info => (
            <InformationResumen key={info.name} information={info} data={data} />
          ))}
        </Grid>
        <Grid container justify="center">
          <Typography className={classes.black_tittle} component="h3" variant="h3">{information.create_tittle}</Typography>
        </Grid>
        <form noValidate autoComplete="off" onSubmit={formik.handleSubmit} >
          <Grid container justify="center">
            {information.components.map(sec => (
              Section(sec)
            ))}
          </Grid>
        </form>
        <Grid style={{ height: "25px" }}></Grid>
      </Grid>
    </>
  )

  function Section(section) {

    if (section.type === "INPUT") {
      return (
        <Grid item xs={11} md={10} className={classes.section}>
          <Paper elevation={3}>
            <Grid container>
              <Typography className={classes.tittle_section} component="h4" variant="h4">{section.name}</Typography>
            </Grid>
            <Grid container >
              <Grid container justify="center">
                <Typography component="h6" variant="h6">{section.message}</Typography>
              </Grid>
              {section.inputs.map(inp => (
                Inputs(inp)
              ))}
            </Grid>
          </Paper>
        </Grid>
      )
    }
    else if (section.type === "BUTTON") {
      return (
        <Grid item xs={11} md={10} className={classes.section}>
          <Paper elevation={3}>
            <Grid container>
              <Typography className={classes.tittle_section} component="h4" variant="h4">{section.name}</Typography>
            </Grid>
            <Grid container >

              <Grid container justify="center">
                <Typography component="h6" variant="h6">{section.message}</Typography>
              </Grid>

              {section.inputs.map(inp => (
                Inputs(inp)
              ))}
              <Grid container justify="center">
                {section.buttons.map(b => (
                  <Button key={b.value} type="submit" className={classes[b.type]} onClick={() => { onHandleClick(b.action) }} item>{b.value}</Button>
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )
    }
  }

  function NumberFormatCustom(props) {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        id="valorNumeros"
        getInputRef={inputRef}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        isNumericString
        prefix="$"
      />
    );
  }

  function Inputs(input) {
    if (input.atribute.type === "STRING") {
      return (
        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column">
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
            <TextField id={input.atribute.value} placeholder={input.placeholder} fullWidth variant="outlined">

            </TextField>
          </Grid>
        </Grid>
      )
    }
    else if (input.atribute.type === "NUMBER") {
      return (
        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column">
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
            <TextField id={input.atribute.value} placeholder={input.placeholder} fullWidth variant="outlined">

            </TextField>
          </Grid>
        </Grid>
      )
    }
    else if (input.atribute.type === "SIGN") {
      return (

        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column" >
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
            <TextField id={input.atribute.value} placeholder={input.placeholder} fullWidth variant="outlined">
            </TextField>
          </Grid>
        </Grid>
      )
    }
    else if (input.atribute.type === "LONG_STRING") {
      return (
        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column" xs={12} >
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
            <TextField id={input.atribute.value} placeholder={input.placeholder} fullWidth variant="outlined" multiline rows={4}>
            </TextField>
          </Grid>
        </Grid>
      )
    }
    else if (input.atribute.type === "DATE") {
      return (
        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column">
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>


            <TextField
              id={input.atribute.value}
              placeholder={input.placeholder}
              fullWidth
              variant="outlined">

            </TextField>
          </Grid>
        </Grid>
      )

    }
    else if (input.atribute.type === "CURRENCY") {
      return (
        <Grid container xs={12} md={(12 / input.size)} className={classes.inputs}>
          <Grid item container direction="column">
            <Typography className={classes.input_text} component="subtitle1" variant="subtitle1">{input.name}</Typography>
            <TextField
              id={input.atribute.value}
              placeholder={input.placeholder}
              fullWidth
              variant="outlined"
            >
            </TextField>
          </Grid>
        </Grid>
      )

    }
    else if (input.atribute.type === "SELECT") {
      return (
        <InputSelect input={input} />
      )
    }
  }

}

export default withRouter(TituloValorCreate)