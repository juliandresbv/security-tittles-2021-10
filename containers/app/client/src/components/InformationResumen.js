import React from 'react'
import { Button, Grid, Paper, Typography, makeStyles } from '@material-ui/core'
import { withRouter } from 'react-router';

import Icon from './Icon';

var CurrencyFormat = require('react-currency-format');

const useStyles = makeStyles((theme) => ({

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
  },
  BLUE: {
    backgroundColor: "#023e8a",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#FFF",
    margin: theme.spacing(0, 2),
    "&:hover, &:focus": {
      backgroundColor: "#046AF0"
    }
  },
  GREY: {
    backgroundColor: "#F76540",
    fontWeight: 'bold',
    textTransform: 'none',
    color: "#000",
    margin: theme.spacing(0, 2),
    "&:hover, &:focus": {
      backgroundColor: "#8E8E8E"
    }
  }
}))

const InformationResumen = (props) => {

  const classes = useStyles()

  const information = props.information
  const data = props.data
  const serviceId = props.serviceId

  const createAs = (rol) => {
    props.history.push("/titulovalor/" + serviceId + "/create/" + rol)
  }

  if (information.type === "INFORMATION") {
    return (

      <Grid item xs={11} md={information.size} className={classes.information}>
        <Paper elevation={3} >
          <Grid container className={classes.padding_info}>
            <Grid item xs={3} container justify="center" alignItems="center">
              <Icon icon={information.icon} size={60} />
            </Grid>
            <Grid item xs={8} container direction={"column"}>
              <Grid item>
                <Typography component="h6" variant="h6" align="right">{information.name}</Typography>
              </Grid>
              <Grid item>
                {ValueFormater(information.valueType, data[information.value], information.color)}
              </Grid>
            </Grid>
          </Grid>

        </Paper>
      </Grid>

    )
  }
  else {
    return (
      <>
        <Grid item xs={11} md={information.size} className={classes.information}>
          <Paper elevation={3} >
            <Grid container className={classes.padding_info}>
              <Grid item xs={3} container justify="center" alignItems="center">
                <Icon icon={information.icon} size={60} />
              </Grid>
              <Grid item xs={5} container direction={"column"}>
                <Grid item>
                  <Typography component="h6" variant="h6" align="right">{information.name}</Typography>
                </Grid>
                <Grid item>
                  {ValueFormater(information.valueType, data[information.value], information.color)}
                </Grid>
              </Grid>
              <Grid item xs={4} container alignItems="center" justify="center">

                {ButtonFormatter(information.buttons[0].type, information.buttons[0].value, information.buttons[0].action, classes)}

              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </>
    )
  }

  function ValueFormater(type_value, value, color) {

    const classes = useStyles()

    if (type_value === "CURRENCY") {
      if (color === "BLUE") {
        return (<Typography component="h3" variant="h3" align="right" className={classes.fondos_positivos_azules}><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>)
      } else if (color === "GREEN") {
        return (<Typography component="h3" variant="h3" align="right" className={classes.fondos_positivos}><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>)
      } else {
        return (<Typography component="h3" variant="h3" align="right" className={classes.fondos_negativos}><CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'$'} /></Typography>)
      }
    }
    return (
      <Typography component="h3" variant="h3" align="right">{value} </Typography>
    )
  }

  function ButtonFormatter(b_type, b_string, rol, classA) {


    if (b_type === "ORANGE") {
      return (<Button onClick={() => { createAs(rol) }} className={classA.ORANGE} item>{b_string}</Button>)
    }
    else if (b_type === "BLUE") {
      return (<Button onClick={() => { createAs(rol) }} className={classA.BLUE} item>{b_string}</Button>)
    }
    else {
      return (<Button onClick={() => { createAs(rol) }} className={classA.GREY} item>{b_string}</Button>)
    }
  }

}

export default withRouter(InformationResumen)